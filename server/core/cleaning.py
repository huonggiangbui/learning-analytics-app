from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Optional
from io import BytesIO
from datetime import datetime
import pandas as pd
import numpy as np
import uuid
import re

from Blob.BlobStorage import BlobStorageModel

def add_prefix(df, prefix, exception):
    """
    :param df: dataframe to operate on
    :param prefix: prefix to add
    :param exception: exceptions when adding, i.e. userid, email, etc
    :return: df added prefix
    """
    cols = df.columns[~df.columns.isin(exception)]
    df.rename(columns=dict(zip(cols, prefix + cols)), inplace=True)
    return df


class Handler(ABC):
    """
    The Handler interface declares a method for building the chain of handlers.
    It also declares a method for executing a request.
    """

    @abstractmethod
    def set_next(self, handler: Handler) -> Handler:
        pass

    @abstractmethod
    def handle(self, request):
        pass


class AbstractHandler(Handler):
    """
    The default chaining behavior can be implemented inside a base handler
    class.
    """
    _students = None
    _next_handler: Handler = None

    def set_students(self, students_df):
      self._students = students_df
      
    def get_students(self):
      return self._students

    def set_next(self, handler: Handler) -> Handler:
        self._next_handler = handler
        return handler

    @abstractmethod
    def handle(self, request: Any):
        if self._next_handler:
            return self._next_handler.handle(request)

        return None


class GradeCleaningHandler(AbstractHandler):
  def handle(self, request: Any):
    fname, df = request[0], request[1]
    if all([col in df.columns.values.tolist() for col in ['Current Score', 'Unposted Current Score', 'Final Score', 'Unposted Final Score']]):
      df = df.drop(df.index[:2])
      df.rename(columns={"Student": "Student Name", "ID": "Student ID", "SIS User ID": "Student SIS ID", "Section": "Section Name"}, inplace=True)
      _students = self.get_students()
      if _students is None:
        student_req = df[['Student Name', 'Student ID', 'Student SIS ID', 'SIS Login ID', 'Integration ID', 'Section Name']]
        super().handle((fname, student_req))
        _students = self.get_students()
      df = df.drop(['Student Name', 'Student ID', 'SIS Login ID', 'Integration ID', 'Section Name'], axis=1)
      df = df.merge(_students[["Student SIS ID", "hashed_id"]], how="outer", on="Student SIS ID")
      df = df.drop(["Student SIS ID"], axis=1)
      f = df.to_csv(index=False)
      filename = 'd_grades.csv'
      return filename, f
    else:
      return super().handle(request)


class ActivityCleaningHandler(AbstractHandler):
  def handle(self, request: Any):
    fname, df = request[0], request[1]
    if all([col in df.columns.values.tolist() for col in ['Content Type', 'Content Name', 'Times Viewed', 'Times Participated', 'Start Date', 'First Viewed', 'Last Viewed']]):
      df.rename(columns={"Student Id": "Student ID"}, inplace=True)
      _students = self.get_students()
      if _students is None:
        student_req = df[['Student Name', 'Student ID', 'Student SIS ID', 'Section Name']]
        super().handle((fname, student_req))
        _students = self.get_students()
      df = df.drop(["Student ID", "Student Name", "Sortable Name", "Section Id", "Section Name", "Course Id", "Course Name"], axis=1)
      df = df.merge(_students[["Student SIS ID", "hashed_id"]], how="outer", on="Student SIS ID")
      df = df.drop(["Student SIS ID"], axis=1)
      df['First Viewed'] = pd.to_datetime(df['First Viewed'])
      df['Last Viewed'] = pd.to_datetime(df['Last Viewed'])
      df['session_time'] = (df['Last Viewed'] - df['First Viewed']).astype('timedelta64[m]')
      f = df.to_csv(index=False)
      filename = 'd_course_activities.csv'
      return filename, f
    else:
      return super().handle(request)


class QuizCleaningHandler(AbstractHandler):
  _quizname_regex = r".+(?= Quiz Student Analysis Report)"
  def handle(self, request: Any):
    fname, df = request[0], request[1]
    if all([col in df.columns.values.tolist() for col in ['submitted', 'attempt', 'n correct', 'n incorrect', 'score']]):
      df.rename(columns={"name": "Student Name", "id": "Student ID", "sis_id": "Student SIS ID", "section": "Section Name"}, inplace=True)
      _students = self.get_students()
      if _students is None:
        student_req = df[['Student Name', 'Student ID', 'Student SIS ID', 'Section Name']]
        super().handle((fname, student_req))
        _students = self.get_students()
      
      quiz_name = re.search(self._quizname_regex, fname).group()
      qids = []
      sub_scores = pd.Series()
      max_sub_scores = []
      max_score = 0
      for col in df.columns:
          qid = re.search(r"\d{7,}", col)
          if qid:
              qid = qid.group()
              qids.append(qid)
              continue
          max_sub_score = re.search(r"\d{1,2}", col)
          if max_sub_score:
              max_sub_score = max_sub_score.group()
              max_sub_scores.append(max_sub_score)
              max_score += float(max_sub_score)
              if sub_scores.empty:
                  sub_scores = df[col]
              else:
                  sub_scores = sub_scores.combine(df[col], func=(lambda s1, s2: f'{s1},{s2}'))
      df['quiz_name'] = quiz_name
      df['questions'] = ",".join(qids)
      df['sub_scores'] = sub_scores
      df['max_sub_scores'] = ",".join(max_sub_scores)
      df['max_score'] = max_score
      df = df[['Student SIS ID', 'quiz_name', 'submitted', 'attempt', 'questions', 'sub_scores', 'max_sub_scores', 'score', 'max_score']]

      df = df.merge(_students[["Student SIS ID", "hashed_id"]], how="outer", on="Student SIS ID")
      df = df.drop(["Student SIS ID"], axis=1)
      f = df.to_csv(index=False)
      filename = 'd_quizzes.csv'
      return filename, f
    else:
      return super().handle(request)


class StudentCleaningHandler(AbstractHandler):
  def handle(self, request: Any):
    df = request[1]
    if all([col in df.columns.values.tolist() for col in ['Student Name', 'Student ID', 'Student SIS ID', 'Section Name']]):
      df['hashed_id'] = df.apply(lambda row: uuid.uuid4(), axis=1)
      self.set_students(df)
      f = df.to_csv(index=False)
      filename = 'students.csv'
      return filename, f
    else:
      return super().handle(request)

class DeadlineHandler(AbstractHandler):
  def handle(self, request: Any):
    fname, df = request[0], request[1]
    cols = df.columns.values.tolist()
    # TODO: Validate deadline file
    if cols == ['quiz_name', 'deadline']:
      df['deadline'] = pd.to_datetime(df['deadline']).dt.tz_localize(
          "America/Toronto").dt.tz_convert("UTC")
      fname = 'quizzes_deadline.csv'
      f = df.to_csv(index=False)
      return fname, f
    else:
      return super().handle(request)

class OthersCleaningHandler(AbstractHandler):
  def handle(self, request: Any):
    fname, df = request[0], request[1]
    _students = self.get_students()
    cols = df.columns.values.tolist()
    IDENTITY_COLS = ['Student SIS ID', 'SIS Id', 'SIS User ID', 'SIS Login ID', 'sis_id', 'Email', 'Student ID']
    student_id_cols = np.intersect1d(cols, IDENTITY_COLS)
    if len(student_id_cols) > 0 and _students is not None:
      if 'Email' in student_id_cols:
        df = df.merge(_students[["Email", "hashed_id"]], how="outer", on="Email")
      elif 'Student ID' in student_id_cols:
        df = df.merge(_students[["Student ID", "hashed_id"]], how="outer", on="Student ID")
      else:
        df.rename(columns={student_id_cols[0]: "Student SIS ID"}, inplace=True)
        df = df.merge(_students[["Student SIS ID", "hashed_id"]], how="outer", on="Student SIS ID")
      df = df.drop(student_id_cols, axis=1)
      f = df.to_csv(index=False)
      if fname == 'students.csv':
        fname = 'students_summary.csv'
      return fname, f
    else:
      return super().handle(request)


def client_cleaning(blob_storage: BlobStorageModel, container_name: str, blob_prefix: str) -> Handler:
  student_bname = f'{blob_prefix}/students.csv'
  _students_blob = blob_storage.get_blob(container_name, student_bname)
  _students_df = None
  if _students_blob:
    data = _students_blob.download_blob()
    with BytesIO() as input_blob:
      data.download_to_stream(input_blob)
      input_blob.seek(0)
      _students_df = pd.read_csv(input_blob, compression='infer')

  grade_cleaner = GradeCleaningHandler()
  activity_cleaner = ActivityCleaningHandler()
  quiz_cleaner = QuizCleaningHandler()
  student_cleaner = StudentCleaningHandler()
  deadline_cleaner = DeadlineHandler()
  others_cleaner = OthersCleaningHandler()

  grade_cleaner.set_next(activity_cleaner).set_next(quiz_cleaner).set_next(student_cleaner).set_next(deadline_cleaner).set_next(others_cleaner)

  if _students_df is not None:
    grade_cleaner.set_students(_students_df)
    activity_cleaner.set_students(_students_df)
    quiz_cleaner.set_students(_students_df)
    student_cleaner.set_students(_students_df)
    others_cleaner.set_students(_students_df)

  return grade_cleaner


# def client_code(handler: Handler) -> None:
#     """
#     The client code is usually suited to work with a single handler. In most
#     cases, it is not even aware that the handler is part of a chain.
#     """

#     for food in ["Nut", "Banana", "Cup of coffee"]:
#         print(f"\nClient: Who wants a {food}?")
#         result = handler.handle(food)
#         if result:
#             print(f"  {result}", end="")
#         else:
#             print(f"  {food} was left untouched.", end="")


# if __name__ == "__main__":
#     monkey = MonkeyHandler()
#     squirrel = SquirrelHandler()
#     dog = DogHandler()

#     monkey.set_next(squirrel).set_next(dog)

#     # The client should be able to send a request to any handler, not just the
#     # first one in the chain.
#     print("Chain: Monkey > Squirrel > Dog")
#     client_code(monkey)
#     print("\n")

#     print("Subchain: Squirrel > Dog")
#     client_code(squirrel)