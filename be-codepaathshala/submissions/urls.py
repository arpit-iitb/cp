from django.urls import path

from submissions.views import AssessmentCreateProblemSubmissionAPI, CompileRunProblemAPI, CreateAssignmentSubmissionAPI, CreateProblemSubmissionAPI, MCQAssignmentSubmissionEvalutationView, MarkVideoAsWatchedAPI, UploadOpenAssignmentSubmissionAPI, ViewWatchedVideoAPI,UserProblemSubmissionListView, FrontendEvaluationView, DeleteAssignmentSubmissionAPI, UploadAssignmentSubmissionAPI,UserAssignmentPastSubmissionsListView, LogWatchedVideo

urlpatterns = [
    path('problem/compile-run/', CompileRunProblemAPI.as_view(), name='compile run code'),
    path('problem/create-submission/', CreateProblemSubmissionAPI.as_view(), name='create problem submission'),
    path('assessment/problem/create-submission/', AssessmentCreateProblemSubmissionAPI.as_view(), name='assessment create problem submission'),
    path('problem/last-submission/', UserProblemSubmissionListView.as_view(), name='last-problem-submission'),
    path('assignment/create-submission/', CreateAssignmentSubmissionAPI.as_view(), name='create assignment submission'),
    path('video/marked-as-watched/', MarkVideoAsWatchedAPI.as_view(), name='mark video as watched'),
    path('video/view-watched/', ViewWatchedVideoAPI.as_view(), name='view watched video'),
    path('mcq-assignment/create-submission/', MCQAssignmentSubmissionEvalutationView.as_view(), name='mcq-assignment-create-submission'),
    path('frontend-evaluation/create-submission/', FrontendEvaluationView.as_view(), name='frontend-eval'),
    path('assignment/upload-submission/', UploadAssignmentSubmissionAPI.as_view(), name='upload-assignment-submission'),
    path('open-assignment/upload-submission/', UploadOpenAssignmentSubmissionAPI.as_view(), name='upload-open-assignment-submission'),
    path('assignment/delete-submission/<int:pk>/', DeleteAssignmentSubmissionAPI.as_view(), name='delete-assignment-submission'),
    path('assignment/last-submissions/', UserAssignmentPastSubmissionsListView.as_view(), name='last-assignment-submission'),
    path("log_video_as_watched/", LogWatchedVideo.as_view(), name="Log Watched Video")
]
