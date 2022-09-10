from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Optional
from io import BytesIO
from datetime import timedelta
import pandas as pd
import statsmodels.api as sm
import matplotlib.pyplot as plt
import seaborn as sns

from Blob.BlobStorage import BlobStorageModel

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
    _container_name = None
    _blob_prefix = None
    _blob_client = None
    _next_handler: Handler = None

    def __init__(self, container_name: str, blob_prefix: str):
      self._container_name = container_name
      self._blob_prefix = blob_prefix
      self._blob_client = BlobStorageModel()

    def _get_blob(self, blob_name: str):
      return self._blob_client.get_blob(self._container_name, blob_name)

    def _upload_table(self, table_name: str, blob) -> Optional[str]:
      fname = f'{self._blob_prefix}/visualizations/{table_name}'
      res = self._blob_client.upload_blob(self._container_name, fname, blob)
      return res
    
    def _upload_fig(self, filename: str, fig) -> Optional[str]:
      container_name = 'visualizations'
      fname = f'{self._container_name}/{self._blob_prefix}/{filename}'
      res = self._blob_client.upload_blob(container_name, fname, fig)
      return res

    def set_next(self, handler: Handler) -> Handler:
        self._next_handler = handler
        return handler

    @abstractmethod
    def handle(self, request: Any):
        if self._next_handler:
            return self._next_handler.handle(request)
        return None


class GradeEngagementAnalysisHandler(AbstractHandler):
  def handle(self, request: Any):
    GRADE_FILENAME = self._blob_prefix + '/d_grades.csv'
    ACTIVITIES_FILENAME = self._blob_prefix + '/d_course_activities.csv'
    if GRADE_FILENAME in request and ACTIVITIES_FILENAME in request:
      grade_blob = self._get_blob(GRADE_FILENAME)
      if grade_blob:
        data = grade_blob.download_blob()
        with BytesIO() as input_blob:
            data.download_to_stream(input_blob)
            input_blob.seek(0)
            df_grades = pd.read_csv(input_blob, compression='infer')

      activities_blob = self._get_blob(ACTIVITIES_FILENAME)
      if activities_blob:
        data = activities_blob.download_blob()
        with BytesIO() as input_blob:
            data.download_to_stream(input_blob)
            input_blob.seek(0)
            df_activities_raw = pd.read_csv(input_blob, compression='infer')
      
      df_activities = self._get_participation_df(df_activities_raw)
      df = pd.merge(df_grades, df_activities,
                    on="hashed_id", how="outer")
      df = df.loc[(df['hashed_id'].notnull()) & (df['Final Score'].notnull()) & (
          df['Times Viewed'].notnull()) & (df['Times Participated'].notnull())]
      Y = df['Final Score']
      X_view = sm.add_constant(df['Times Viewed'])
      mod_sm_view = sm.OLS(Y, X_view)
      f_view = mod_sm_view.fit().summary().tables[1].as_csv()
      fname_view = 'grade_view_LR.csv'
      self._upload_table(fname_view, f_view)

      X_participation = sm.add_constant(df['Times Participated'])
      mod_sm_participation = sm.OLS(Y, X_participation)
      f_participation = mod_sm_participation.fit().summary().tables[1].as_csv()
      fname_participation = 'grade_participation_LR.csv'
      self._upload_table(fname_participation, f_participation)

    return super().handle(request)

  def _get_participation_df(self, df):
    data = []
    student_ids = df['hashed_id'].unique()
    for student in student_ids:
      student_df = df.loc[df['hashed_id'] == student]
      views = student_df['Times Viewed'].sum()
      participations = student_df['Times Participated'].sum()
      data.append((student, views, participations))

    result_df = pd.DataFrame(
        data, columns=['hashed_id', 'Times Viewed', 'Times Participated'])
    return result_df


class GradeQuizAnalysisHandler(AbstractHandler):
  def handle(self, request: Any):
    GRADE_FILENAME = self._blob_prefix + '/d_grades.csv'
    QUIZ_FILENAME = self._blob_prefix + '/d_quizzes.csv'
    if GRADE_FILENAME in request and QUIZ_FILENAME in request:
      quiz_blob = self._get_blob(QUIZ_FILENAME)
      if quiz_blob:
        data = quiz_blob.download_blob()
        with BytesIO() as input_blob:
            data.download_to_stream(input_blob)
            input_blob.seek(0)
            df_quizzes = pd.read_csv(
                input_blob, compression='infer', parse_dates=['submitted'])

      df_quizzes = df_quizzes.loc[(df_quizzes['hashed_id'].notnull())]
      df_quizzes['score_derived'] = df_quizzes['score'] * \
          100 / df_quizzes['max_score']
      df_quizzes['best_score'] = df_quizzes.groupby('hashed_id')["score_derived"].transform('max')

      df_quizzes_first = df_quizzes.loc[df_quizzes['attempt'] == 1]
      df_quizzes_best = df_quizzes.loc[df_quizzes['best_score'] == df_quizzes['score_derived']]
      df_quizzes_first_avg = self._get_quiz_score_df('First Attempts', df_quizzes_first)
      df_quizzes_best_avg = self._get_quiz_score_df('Best Attempts', df_quizzes_best)
      df_quizzes_analysis = pd.merge(df_quizzes_first_avg, df_quizzes_best_avg, on="hashed_id", how="outer")
      
      grade_blob = self._get_blob(GRADE_FILENAME)
      if grade_blob:
        data = grade_blob.download_blob()
        with BytesIO() as input_blob:
            data.download_to_stream(input_blob)
            input_blob.seek(0)
            df_grades = pd.read_csv(input_blob, compression='infer')
      
      df = pd.merge(df_grades, df_quizzes_analysis, on="hashed_id", how="outer")
      df = df.loc[(df['hashed_id'].notnull()) & (df['Final Score'].notnull()) & (df['Quiz Average (First Attempts)'].notnull()) & (df['Quiz Average (Best Attempts)'].notnull())]
      Y = df['Final Score']
      X_first = sm.add_constant(df['Quiz Average (First Attempts)'])
      mod_sm_first = sm.OLS(Y, X_first)
      f_first = mod_sm_first.fit().summary().tables[1].as_csv()
      fname_first = 'grade_quiz_attempt1st_LR.csv'
      self._upload_table(fname_first, f_first)

      X_best = sm.add_constant(df['Quiz Average (Best Attempts)'])
      mod_sm_best = sm.OLS(Y, X_best)
      f_best = mod_sm_best.fit().summary().tables[1].as_csv()
      fname_best = 'grade_quiz_attemptbest_LR.csv'
      self._upload_table(fname_best, f_best)
      
    return super().handle(request)
  
  def _get_quiz_score_df(self, attempt_name, df):
    data = []
    student_ids = df['hashed_id'].unique()
    for student in student_ids:
      student_df = df.loc[df['hashed_id'] == student]
      student_df = student_df.drop_duplicates(subset=['quiz_name'])
      if attempt_name == 'First Attempts':
        avg_score = student_df['score_derived'].mean()
        data.append((student, avg_score))
      else:
        avg_score = student_df['best_score'].mean()
        data.append((student, avg_score))

    result_df = pd.DataFrame(data, columns=['hashed_id', f'Quiz Average ({attempt_name})'])
    return result_df


class QuizAnalysisHandler(AbstractHandler):
  def handle(self, request: Any):
    QUIZ_FILENAME = self._blob_prefix + '/d_quizzes.csv'
    DEADLINE_FILENAME = self._blob_prefix + '/quizzes_deadline.csv'
    if QUIZ_FILENAME in request and DEADLINE_FILENAME in request:
      quiz_blob = self._get_blob(QUIZ_FILENAME)
      if quiz_blob:
        data = quiz_blob.download_blob()
        with BytesIO() as input_blob:
            data.download_to_stream(input_blob)
            input_blob.seek(0)
            df_quizzes = pd.read_csv(input_blob, compression='infer', parse_dates=['submitted'])
      
      deadline_blob = self._get_blob(DEADLINE_FILENAME)
      if deadline_blob:
        data = deadline_blob.download_blob()
        with BytesIO() as input_blob:
            data.download_to_stream(input_blob)
            input_blob.seek(0)
            df_deadline = pd.read_csv(input_blob, compression='infer', parse_dates=['deadline'])
      
      df_quizzes = df_quizzes.merge(df_deadline, how="outer", on="quiz_name")
      df_quizzes = df_quizzes.loc[(df_quizzes['hashed_id'].notnull()) & (df_quizzes['deadline'].notnull())]
      df_quizzes = df_quizzes.loc[(df_quizzes['deadline'] >= df_quizzes['submitted'])]
      df_quizzes['score_derived'] = df_quizzes['score'] * \
          100 / df_quizzes['max_score']
      df_quizzes['best_score'] = df_quizzes.groupby('hashed_id')["score_derived"].transform('max')
      df_quizzes['submitted_derived'] = (df_quizzes['deadline']-df_quizzes['submitted']).astype('timedelta64[h]')

      all_figs = {}
      all_stats = {}

      all_quiz_name = df_quizzes['quiz_name'].unique()
      for quiz_name in all_quiz_name:
        quiz_df = df_quizzes.loc[(df_quizzes['quiz_name']) == quiz_name]
        attempt_figs, attempt_descriptive_stats = self._get_analysis_by_attempt(quiz_name, quiz_df)
        all_figs.update(attempt_figs)
        all_stats.setdefault('attempt', []).append(attempt_descriptive_stats)
        starttime_figs, starttime_descriptive_stats = self._get_analysis_by_time(quiz_name, quiz_df)
        all_figs.update(starttime_figs)
        all_stats.setdefault('starttime', []).append(starttime_descriptive_stats)

      for fname in all_figs:
          fig = all_figs[fname]
          self._upload_fig(fname, fig)

      for stat_name in all_stats:
        table_name = f'quiz_{stat_name}_summary.csv'
        table = pd.DataFrame(all_stats[stat_name]).to_csv(index=False)
        self._upload_table(table_name, table)

    return super().handle(request)

  def _get_analysis_by_time(self, quiz_name, df):
    figs = {}

    df_attempt1st = df.loc[df['attempt'] == 1]
    fig_starttime_hist = BytesIO()
    plt.figure()
    sns.histplot(
        data=df_attempt1st, x='submitted_derived', multiple='dodge',
        stat='percent', bins=10
    )
    plt.savefig(fig_starttime_hist, format="png")
    figs[f'[{quiz_name}]starttime_hist.png'] = fig_starttime_hist.getvalue()

    descriptive_stats = df_attempt1st['submitted_derived'].describe()
    descriptive_stats = pd.concat(
        [pd.Series({'quiz_name': quiz_name}), descriptive_stats])
    starttime_25th, starttime_50th, starttime_75th = descriptive_stats[
        '25%'], descriptive_stats['50%'], descriptive_stats['75%']
    df_25th = df.loc[df['submitted_derived'] <= starttime_25th].drop_duplicates(
        subset=['hashed_id'], keep="last")
    df_25th['group'] = f'Students started between {descriptive_stats["min"]}-{starttime_25th} hours before deadline, N={df_25th.shape[0]}'
    df_50th = df.loc[(starttime_25th < df['submitted_derived']) & (
        df['submitted_derived'] <= starttime_50th)].drop_duplicates(subset=['hashed_id'], keep="last")
    df_50th['group'] = f'Students started between {starttime_25th}-{starttime_50th} hours before deadline, N={df_50th.shape[0]}'
    df_75th = df.loc[(starttime_50th < df['submitted_derived']) & (
        df['submitted_derived'] <= starttime_75th)].drop_duplicates(subset=['hashed_id'], keep="last")
    df_75th['group'] = f'Students started between {starttime_50th}-{starttime_75th} hours before deadline, N={df_75th.shape[0]}'
    df_100th = df.loc[(starttime_75th < df['submitted_derived'])].drop_duplicates(
        subset=['hashed_id'], keep="last")
    df_100th['group'] = f'Students started between {starttime_75th}-{descriptive_stats["max"]} hours before deadline, N={df_100th.shape[0]}'
    t_ = pd.concat([df_25th, df_50th, df_75th, df_100th])
    fig_score_by_starttime_group = BytesIO()
    plt.figure(figsize=(30, 10))
    sns.boxplot(y="score", x="group", data=t_)
    plt.savefig(fig_score_by_starttime_group, format="png")
    figs[f'[{quiz_name}]scores_by_starttime_group_boxplot.png'] = fig_score_by_starttime_group.getvalue()

    return figs, descriptive_stats

  def _get_analysis_by_attempt(self, quiz_name, df):
    figs = {}
    
    df['total_attempt'] = df.groupby(
        'hashed_id')["attempt"].transform('max')
    df_attempt = df.drop_duplicates(subset=['hashed_id'])

    fig_total_attempts_hist = BytesIO()
    plt.figure()
    sns.histplot(
        data=df_attempt, x='total_attempt', multiple='dodge',
        stat='percent', bins=10
    )
    plt.savefig(fig_total_attempts_hist, format="png")
    figs[f'[{quiz_name}]total_attempts_hist.png'] = fig_total_attempts_hist.getvalue()

    df_bestattempt = df.loc[df['best_score'] == df['score_derived']].drop_duplicates(subset=['hashed_id'], keep="last")
    figs.update(self._get_score_analysis_by_attempt('attempt1st', df.loc[df['attempt'] == 1]))
    figs.update(self._get_score_analysis_by_attempt('attemptbest', df_bestattempt))

    fig_attempt_hist= BytesIO()
    plt.figure()
    sns.histplot(
        data=df_bestattempt, x='attempt', multiple='dodge',
        stat='percent', bins=10
    )
    plt.savefig(fig_attempt_hist, format="png")
    figs[f'[{quiz_name}]attempt_to_best_hist.png'] = fig_attempt_hist.getvalue()

    descriptive_stats = df_attempt['total_attempt'].describe()
    descriptive_stats = pd.concat([pd.Series({'quiz_name': quiz_name}), descriptive_stats])
    attempt_25th, attempt_50th, attempt_75th = descriptive_stats['25%'], descriptive_stats['50%'], descriptive_stats['75%']
    df_25th = df.loc[df['total_attempt'] <= attempt_25th].drop_duplicates(subset=['hashed_id'], keep="last")
    df_25th['group'] = f'Students with {descriptive_stats["min"]}-{attempt_25th} total attempts, N={df_25th.shape[0]}'
    df_50th = df.loc[(attempt_25th < df['total_attempt']) & (df['total_attempt'] <= attempt_50th)].drop_duplicates(subset=['hashed_id'], keep="last")
    df_50th['group'] = f'Students with {attempt_25th}-{attempt_50th} total attempts, N={df_50th.shape[0]}'
    df_75th = df.loc[(attempt_50th < df['total_attempt']) & (df['total_attempt'] <= attempt_75th)].drop_duplicates(subset=['hashed_id'], keep="last")
    df_75th['group'] = f'Students with {attempt_50th}-{attempt_75th} total attempts, N={df_75th.shape[0]}'
    df_100th = df.loc[(attempt_75th < df['total_attempt'])].drop_duplicates(subset=['hashed_id'], keep="last")
    df_100th['group'] = f'Students with {attempt_75th}-{descriptive_stats["max"]} total attempts, N={df_100th.shape[0]}'
    t_ = pd.concat([df_25th, df_50th, df_75th, df_100th])
    fig_score_by_attempt_group = BytesIO()
    plt.figure(figsize=(20, 5))
    sns.boxplot(y="score", x="group", data=t_)
    plt.savefig(fig_score_by_attempt_group, format="png")
    figs[f'[{quiz_name}]scores_by_attempt_group_boxplot.png'] = fig_score_by_attempt_group.getvalue()

    return figs, descriptive_stats

  def _get_score_analysis_by_attempt(self, attempt_name, df):
    figs = {}
    quiz_name = df['quiz_name'].unique()[0]    
    fig_score_attempt_hist = BytesIO()
    plt.figure()
    sns.histplot(
        data=df, x='score_derived', multiple='dodge',
        stat='percent', bins=10
    )
    plt.savefig(fig_score_attempt_hist, format="png")
    figs[f'[{quiz_name}]score_{attempt_name}_hist.png'] = fig_score_attempt_hist.getvalue()

    return figs


class EngagementAnalysisHandler(AbstractHandler):
  def handle(self, request: Any):
    ENGAGEMENT_FILENAME = self._blob_prefix + '/d_course_activities.csv'
    if ENGAGEMENT_FILENAME in request:
      engagement_blob = self._get_blob(ENGAGEMENT_FILENAME)
      if engagement_blob:
        data = engagement_blob.download_blob()
        with BytesIO() as input_blob:
            data.download_to_stream(input_blob)
            input_blob.seek(0)
            df_engagement = pd.read_csv(input_blob, compression='infer', parse_dates=[
                                        'Start Date', 'First Viewed', 'Last Viewed'])
        all_figs = {}
        all_tables = {}

        figs_aggregate = self._get_aggregate_analysis(df_engagement)
        all_figs.update(figs_aggregate)

        earliest_activity = min(df_engagement['Start Date'])
        lastest_activity = max(df_engagement['Start Date'])
        days = (lastest_activity - earliest_activity).days
        for i in range(0, days, 7):
          start_date = earliest_activity + timedelta(i)
          end_date = start_date + timedelta(6)
          if end_date > lastest_activity:
            end_date = lastest_activity
          week_df = df_engagement.loc[df_engagement["Start Date"].between(start_date, end_date)]
          figs = self._get_figs_week_analysis(week_df, start_date.date())
          all_figs.update(figs)
          table = self._get_table_week_analysis(week_df)
          all_tables[start_date.date()] = table

        for fname in all_figs:
          fig = all_figs[fname]
          self._upload_fig(fname, fig)
        
        for d in all_tables:
          table_name = f'[{d}]engagement.csv'
          self._upload_table(table_name, all_tables[d])

    return super().handle(request)

  def _get_aggregate_analysis(self, df):
    # TODO: Get participation visualization
    figs = {}

    plt.figure(figsize=(30, 10))
    fig_content_view_bar = BytesIO()
    sns.barplot(x="Content Type", y="Times Viewed", data=df)
    plt.savefig(fig_content_view_bar, format="png")
    fig_content_session_bar = BytesIO()
    sns.barplot(x="Content Type", y="session_time", data=df)
    plt.savefig(fig_content_session_bar, format="png")
    figs['aggregate_contenttype_view_barplot.png'] = fig_content_view_bar.getvalue()
    figs['aggregate_contenttype_session_barplot.png'] = fig_content_session_bar.getvalue()

    fig_content_view_cat = BytesIO()
    sns.catplot(data=df, y="Times Viewed", x="Content Type", height=5, aspect=5)
    plt.savefig(fig_content_view_cat, format="png")
    fig_content_session_cat = BytesIO()
    sns.catplot(data=df, y="session_time", x="Content Type", height=5, aspect=5)
    plt.savefig(fig_content_session_cat, format="png")
    figs['aggregate_contenttype_view_catplot.png'] = fig_content_view_cat.getvalue()
    figs['aggregate_contenttype_session_catplot.png'] = fig_content_session_cat.getvalue()

    return figs

  def _get_figs_week_analysis(self, df, start_date):
    figs = {}
    
    df.rename(columns={"Start Date": "Days of week"}, inplace=True)
    plt.figure(figsize=(10, 10))
    fig_start_view_line = BytesIO()
    sns.lineplot(data=df, x="Days of week", y="Times Viewed")
    plt.savefig(fig_start_view_line, format="png")
    plt.figure(figsize=(10, 10))
    fig_start_participation_line = BytesIO()
    sns.lineplot(data=df, x="Days of week", y="Times Participated")
    plt.savefig(fig_start_participation_line, format="png")
    plt.figure(figsize=(10, 10))
    fig_start_session_line = BytesIO()
    sns.lineplot(data=df, x="Days of week", y="session_time")
    plt.savefig(fig_start_session_line, format="png")
    figs[f'[{start_date}]view_lineplot.png'] = fig_start_view_line.getvalue()
    figs[f'[{start_date}]participation_lineplot.png'] = fig_start_participation_line.getvalue()
    figs[f'[{start_date}]session_lineplot.png'] = fig_start_session_line.getvalue()

    plt.figure(figsize=(30, 10))
    fig_total_contenttype_view_bar = BytesIO()
    sns.barplot(x="Content Type", y="Times Viewed", data=df, estimator=sum)
    plt.savefig(fig_total_contenttype_view_bar, format="png")
    fig_contenttype_view_bar = BytesIO()
    sns.barplot(x="Content Type", y="Times Viewed", data=df)
    plt.savefig(fig_contenttype_view_bar, format="png")
    fig_contenttype_session_bar = BytesIO()
    sns.barplot(x="Content Type", y="session_time", data=df)
    plt.savefig(fig_contenttype_session_bar, format="png")
    figs[f'[{start_date}]total_contenttype_view_barplot.png'] = fig_total_contenttype_view_bar.getvalue()
    figs[f'[{start_date}]contenttype_view_barplot.png'] = fig_contenttype_view_bar.getvalue()
    figs[f'[{start_date}]contenttype_session_barplot.png'] = fig_contenttype_session_bar.getvalue()

    fig_contenttype_view_cat = BytesIO()
    sns.catplot(data=df, y="Times Viewed", x="Content Type", height=5, aspect=5)
    plt.savefig(fig_contenttype_view_cat, format="png")
    fig_contenttype_session_cat = BytesIO()
    sns.catplot(data=df, y="session_time", x="Content Type", height=5, aspect=5)
    plt.savefig(fig_contenttype_session_cat, format="png")
    figs[f'[{start_date}]contenttype_view_catplot.png'] = fig_contenttype_view_cat.getvalue()
    figs[f'[{start_date}]contenttype_session_catplot.png'] = fig_contenttype_session_cat.getvalue()

    plt.figure(figsize=(60, 10))
    fig_total_contentname_view_bar = BytesIO()
    sns.barplot(x="Content Name", y="Times Viewed", data=df, estimator=sum)
    plt.savefig(fig_total_contentname_view_bar, format="png")
    fig_contentname_view_bar = BytesIO()
    sns.barplot(x="Content Name", y="Times Viewed", data=df)
    plt.savefig(fig_contentname_view_bar, format="png")
    fig_contentname_session_bar = BytesIO()
    sns.barplot(x="Content Name", y="session_time", data=df)
    plt.savefig(fig_contentname_session_bar, format="png")
    figs[f'[{start_date}]total_contentname_view_barplot.png'] = fig_total_contentname_view_bar.getvalue()
    figs[f'[{start_date}]contentname_view_barplot.png'] = fig_contentname_view_bar.getvalue()
    figs[f'[{start_date}]contentname_session_barplot.png'] = fig_contentname_session_bar.getvalue()

    fig_contentname_view_cat = BytesIO()
    sns.catplot(data=df, y="Times Viewed",
                x="Content Name", height=5, aspect=9)
    plt.savefig(fig_contentname_view_cat, format="png")
    fig_contentname_session_cat = BytesIO()
    sns.catplot(data=df, y="session_time",
                x="Content Name", height=5, aspect=9)
    plt.savefig(fig_contentname_session_cat, format="png")
    figs[f'[{start_date}]contentname_view_catplot.png'] = fig_contentname_view_cat.getvalue()
    figs[f'[{start_date}]contentname_session_catplot.png'] = fig_contentname_session_cat.getvalue()

    return figs

  def _get_table_week_analysis(self, df):
    content_table_data = []
    all_content = df['Content Name'].unique()

    for content in all_content:
      content_df = df[(df['Content Name'] == content)]
      views = content_df['Times Viewed'].sum()
      participation = content_df['Times Participated'].sum()
      n_students = content_df['hashed_id'].nunique()
      avg_session_time = round(content_df['session_time'].mean())
      content_table_data.append(
          (content, views, participation, n_students, avg_session_time))

    table_file = pd.DataFrame(content_table_data, columns=[
        'Content Name', 'Total Views', 'Total Participations', 'Number of students engaged', 'Average session time (in minutes)']).to_csv(index=False)

    return table_file


def client_analysis(container_name: str, blob_prefix: str) -> Handler:
  grade_engagement_analysis = GradeEngagementAnalysisHandler(container_name, blob_prefix)
  grade_quiz_analysis = GradeQuizAnalysisHandler(container_name, blob_prefix)
  quiz_analysis = QuizAnalysisHandler(container_name, blob_prefix)
  engagement_analysis = EngagementAnalysisHandler(container_name, blob_prefix)

  grade_engagement_analysis.set_next(grade_quiz_analysis).set_next(quiz_analysis).set_next(engagement_analysis)
  
  return grade_engagement_analysis