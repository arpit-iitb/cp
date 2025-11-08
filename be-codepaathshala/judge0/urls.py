from django.urls import path
from .views import *

urlpatterns = [
    path('submissions/', SubmissionsView.as_view(), name='submissions'),
    path('submissions/<str:token>/', SubmissionsTokenView.as_view(), name='submissions-token'),
    path('submissions-batch/',SubmissionsBatchView.as_view(), name='submissions-batch'),
    path('languages/',LanguagesView.as_view(), name='languages'),
    path('languages/<int:id>/',LanguagesIdView.as_view(), name='languages-id'),
    path('languages/all/',LanguagesAllView.as_view(), name='languages-all'),
    path('statuses/',StatusesView.as_view(), name='statuses'),
    path('statistics/',StatisticsView.as_view(), name='statistics'),
    path('workers/',WorkersView.as_view(), name='workers'),
    path('about/',AboutView.as_view(), name='about'),
    path('version/',VersionView.as_view(), name='version'),
    path('isolate/',IsolateView.as_view(), name='isolate'),
    path('license/',LicenseView.as_view(), name='license'),


    # Judge0- extra
    path('extra/submissions/', ExtraSubmissionsView.as_view(), name='extra-submissions'),
    path('extra/submissions/<str:token>/', ExtraSubmissionsTokenView.as_view(), name='extra-submissions-token'),
    path('extra/submissions-batch/',ExtraSubmissionsBatchView.as_view(), name='extra-submissions-batch'),
    path('extra/languages/',ExtraLanguagesView.as_view(), name='languages'),
    path('extra/languages/<int:id>/',ExtraLanguagesIdView.as_view(), name='languages-id'),
    path('extra/languages/all/',ExtraLanguagesAllView.as_view(), name='languages-all'),
    path('extra/statuses/',ExtraStatusesView.as_view(), name='statuses'),
    path('extra/statistics/',ExtraStatisticsView.as_view(), name='statistics'),
    path('extra/workers/',ExtraWorkersView.as_view(), name='workers'),
    path('extra/about/',ExtraAboutView.as_view(), name='about'),
    path('extra/version/',ExtraVersionView.as_view(), name='version'),
    path('extra/isolate/',ExtraIsolateView.as_view(), name='isolate'),
    path('extra/license/',ExtraLicenseView.as_view(), name='license'),
    
     
]
