from django.urls import path

from .views import ReportAnIssueAPIView, VideoTitleListAPIView, AIVideoDescriptionAPIView, AllBatchesListAPIView, AIVideoMCQAPIView

urlpatterns = [
    path('report-issue/', ReportAnIssueAPIView.as_view(), name='report_an_issue'),
    path('video-title/', VideoTitleListAPIView.as_view(), name='video-title'),
    path('allbatches/', AllBatchesListAPIView.as_view(), name='all batches list'),
    path('ai-video-description/', AIVideoDescriptionAPIView.as_view(), name='video-ai-description'),
    path('ai-video-mcq/', AIVideoMCQAPIView.as_view(), name='video-ai-mcq')
]   