from django.urls import path

from .views import  ActiveDaysAPIView, AssignmentsAPIView, LessonListWeekAPIView,LeaderboardAPIView, LessonListAPIView, NextLesson,PrevLesson, ProblemAPIView, VideoLecturesAPIView,ProblemReportCreateView, GetPracticeQuestions, TextAPIView
from batches.views import UserAssociatedBatchListView, UserBatchDetailsView , MCQAssignmentsView

urlpatterns = [
    path('api/lessons/', LessonListAPIView.as_view(), name='lesson-list'),
    path('api/lessons/<int:weeknumber>/', LessonListWeekAPIView.as_view(), name='lesson-list-week'),
    path('api/video-lectures/', VideoLecturesAPIView.as_view(), name='video-lectures-detail'),
    path('api/text/', TextAPIView.as_view(), name='text'),
    path('api/assignments/', AssignmentsAPIView.as_view(), name='assignments-detail'),
    path('api/leaderboard/', LeaderboardAPIView.as_view(), name='leaderboard'),
    path('api/active-days/', ActiveDaysAPIView.as_view(), name='active-days'),
    path('api/get-practice-questions/', GetPracticeQuestions.as_view(), name='Get Practice Question'),

    path('api/my-courses/', UserAssociatedBatchListView.as_view(), name='my-courses'),
    path('api/user-registered-batch-details/',UserBatchDetailsView.as_view(),name='user-registered-batch-details'),

    #? Problem Related Urls
    path('api/problem/', ProblemAPIView.as_view(), name='problem-detail'),
    path('api/problem/reports/<int:problem_id>/', ProblemReportCreateView.as_view(), name='problem-report'),


    #? MCQ Assignment related urls
     path('api/mcq-assignment/', MCQAssignmentsView.as_view(), name='mcq-assignment'),
     path('api/next-lesson/', NextLesson.as_view(), name='mcq-assignment'),
     path('api/prev-lesson/', PrevLesson.as_view(), name='mcq-assignment'),
]
