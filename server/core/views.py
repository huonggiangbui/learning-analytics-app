import json
from io import StringIO, BytesIO
from core import app
import requests
from flask import request, Response
import pandas as pd
from Blob.BlobStorage import BlobStorageModel
from core.cleaning import client_cleaning
from core.analysis import client_analysis

url = "https://q.utoronto.ca/api/v1"

@app.route('/api/login', methods=['POST'])
def login():
    token = request.json.get('accessToken')
    if not token:
        return 'Must provide access token', 400
    headers = {
        'Authorization': 'Bearer ' + token
    }
    response = requests.request("GET", url + '/users/self', headers=headers).json()
    return response


@app.route('/api/courses', methods=['GET'])
def getCourses():
    auth = request.headers['Authorization']
    if not auth:
        return 'Must provide authorization headers', 400
    response = requests.request("GET", url + '/courses', headers={'Authorization': auth}, params={'enrollment_state': 'active', 'enrollment_type': 'teacher'}).json()
    return Response(json.dumps(response), mimetype='application/json')


@app.route('/api/courses/:id', methods=['GET'])
def getOneCourse():
    auth = request.headers['Authorization']
    if not auth:
        return 'Must provide authorization headers', 400
    course_id = request.args.get('id')
    response = requests.request("GET", url + f'/courses/{course_id}', headers={'Authorization': auth}).json()
    if response.get('enrollments') is None or len(response.get('enrollments')) == 0:
        return 'User not enrolled in this course', 401
    if response['enrollments'][0]['type'] != 'teacher':
        return 'Must be a teacher of this course to view analytics', 403
    uid = str(response['enrollments'][0]['user_id'])
    blob_storage = BlobStorageModel()

    visualization_path = f'{uid}/{course_id}'
    container = blob_storage.get_container("visualizations")

    # for blob in container.list_blobs():
    #     if visualization_path in blob['name']:
    #         blob_storage.delete_blob('visualizations', blob['name'])
    # response['visualizations'] = []

    visualization_list = list(blob['name'] for blob in container.list_blobs() if visualization_path in blob['name'])
    response['visualizations'] = visualization_list

    response['allFiles'] = []
    response['tables'] = {}
    all_blobs = blob_storage.list_blobs_in_container(uid)
    table_path = f'{course_id}/visualizations'
    for b in all_blobs:
        b_name = b['name']
        if table_path in b_name:
            data = blob_storage.get_blob(uid, b_name).download_blob()
            with BytesIO() as input_blob:
                data.download_to_stream(input_blob)
                input_blob.seek(0)
                response['tables'][b_name] = input_blob.getvalue().decode(
                    'utf-8')
        elif course_id in b_name:
            response.get('allFiles').append(b_name)
    return Response(json.dumps(response), mimetype='application/json')


@app.route('/api/courses/:id', methods=['POST'])
def uploadData():
    auth = request.headers['Authorization']

    if not auth:
        return 'Must provide authorization headers', 400
    response = requests.request("GET", f'{url}/users/self', headers={'Authorization': auth}).json()
    if not response['id']:
        return 'User not found', 404

    all_res = {'uploaded': [], 'stored': [], 'allFiles': [], 'visualizations': [], 'tables': {}}

    uid = str(response['id'])
    course_id = str(request.args.get('id'))

    blob_storage = BlobStorageModel()

    _cleaning_handler = client_cleaning(blob_storage, uid, course_id)
    files = request.files.getlist("data[]")
    filemap = {}

    for f in files:
        df = pd.read_csv(f)
        result = _cleaning_handler.handle((f.filename, df))
        if result:
            fname, cleaned_file = result[0], result[1]
            blob_name = f'{course_id}/{fname}'
            if filemap.get(blob_name) is None:
                filemap[blob_name] = cleaned_file
            else:
                if blob_name in [f'{course_id}/d_course_activities.csv', f'{course_id}/d_quizzes.csv']:
                    old_df = pd.read_csv(StringIO(filemap[blob_name]))
                    new_df = pd.read_csv(StringIO(cleaned_file))
                    df =  pd.concat([old_df, new_df])
                    filemap[blob_name] = df.to_csv(index=False)
                else:
                    filemap[blob_name] = cleaned_file
            all_res.get('uploaded').append(f.filename)

    for fname in filemap:
        f_to_upload = filemap[fname]
        other_blob = blob_storage.get_blob(uid, fname)
        if other_blob and fname in [f'{course_id}/d_course_activities.csv', f'{course_id}/d_quizzes.csv']:
                data = other_blob.download_blob()
                with BytesIO() as input_blob:
                    data.download_to_stream(input_blob)
                    input_blob.seek(0)
                    old_df = pd.read_csv(input_blob, compression='infer')
                new_df = pd.read_csv(StringIO(f_to_upload))
                df =  pd.concat([old_df, new_df])
                f_to_upload = df.to_csv(index=False)
        res = blob_storage.upload_blob(uid, fname, f_to_upload)
        if res:
            all_res.get('stored').append(fname)
    
    all_res['allFiles'] = list(
        blob['name'] for blob in blob_storage.list_blobs_in_container(uid) if course_id in blob['name'] and 'visualizations' not in blob['name'])

    _analysis_handler = client_analysis(uid, course_id)
    analysis_files = all_res.get('stored').copy()
    deadline_fname = f'{course_id}/quizzes_deadline.csv'
    quiz_fname = f'{course_id}/d_quizzes.csv'
    if deadline_fname in all_res.get('allFiles') and quiz_fname in all_res.get('allFiles'):
        if deadline_fname not in analysis_files:
            analysis_files += [deadline_fname]
        elif quiz_fname not in analysis_files:
            analysis_files += [quiz_fname]
    _analysis_handler.handle(analysis_files)

    blob_list = blob_storage.list_blobs_in_container('visualizations')
    visualization_path = f'{uid}/{course_id}'
    visualization_list = list(blob['name'] for blob in blob_list if visualization_path in blob['name'])
    all_res['visualizations'] = visualization_list

    table_blob = blob_storage.list_blobs_in_container(uid)
    table_path = f'{course_id}/visualizations'
    for t in table_blob:
        t_name = t['name']
        if table_path in t_name:
            data = blob_storage.get_blob(uid, t_name).download_blob()
            with BytesIO() as input_blob:
                data.download_to_stream(input_blob)
                input_blob.seek(0)
                all_res['tables'][t_name] = input_blob.getvalue().decode('utf-8')

    return Response(json.dumps(all_res, default=str), mimetype='application/json')