from django.urls import path
from .views import AdminBatchUsersAPIView, AdminBatchListAPIView, CreateStudentAccountAPIView,RetriveveUpdateDeleteStudentAccountAPIView, ChangePasswordAPIView, GetBatchStats, GetSpentTimeInfo, CSVtoMCQ, GetUserStats, SpentTimeInfoUser, TriggerBatchStatsEmail, CSVtoQuestions, CreateBulkStudentAccountAPIView, UserDataExportAPIView

from .lesson_views import BatchLessonsAdminAPIView, CreateVideoLectureAPIView, UpdateLessonPriorityAPIView, DeleteLessonAPIView, LessonAdminAPIView

urlpatterns = [
    path('batch-users/', AdminBatchUsersAPIView.as_view(), name='admin-batch_users'),
    path('batch-lists/', AdminBatchListAPIView.as_view(), name='admin-batch_list'),
    path('create-student-account/', CreateStudentAccountAPIView.as_view(), name='create-student-account'),
    path('create-bulk-student-account/', CreateBulkStudentAccountAPIView.as_view(), name='create-bulk-student-account'),
    path('student-account/<str:username>', RetriveveUpdateDeleteStudentAccountAPIView.as_view(), name='get-update-delete-student-account'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change password'),
    path('export-student-progress-report/', UserDataExportAPIView.as_view(), name='student progress report'),

    # ? Lessons Related api

    path('create-video-lecture/', CreateVideoLectureAPIView.as_view(), name='create-video-lecture'),
    path('lesson-weekly/', LessonAdminAPIView.as_view(), name='get-lesson-weekly-content'),
    path('batch-contents/', BatchLessonsAdminAPIView.as_view(), name='batch-contents'),
    path('delete-lesson/', DeleteLessonAPIView.as_view(), name='delete-lesson'),
    path('update-lessons-priority/', UpdateLessonPriorityAPIView.as_view(), name='update-lessons-priority'),
    path('batch-stats/', GetBatchStats.as_view(), name = "get batch stats"),
    path('get-spent-time-info/', GetSpentTimeInfo.as_view(), name = "get spent time info"),
    path('csv-to-mcq/',CSVtoMCQ.as_view(),name='csv to mcq'),
    path('csv-to-questions/', CSVtoQuestions.as_view(), name="csv to questions"),
    path('user-stats/', GetUserStats.as_view(), name='get indivisual user stats'),  
    path('user-time-stats/', SpentTimeInfoUser.as_view(), name='get user spent time'),
    path('tigger-batch-stats-mail/', TriggerBatchStatsEmail.as_view(), name = "trigger batch stats"),
]

