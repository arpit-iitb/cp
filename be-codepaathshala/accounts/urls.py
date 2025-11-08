from django.urls import path
from accounts.views import UserRegistrationView, LoginAPIView,UserProfileView, CeleryTest,AssosiatedBatchesView,ChangePasswordView,RestPasswordView,SessionLogger, GetSpentTimeInfoUser,SetNewPassword

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', LoginAPIView.as_view(), name='user-login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('reset-password/', RestPasswordView.as_view(), name='reset_password'),
    path('assosiated-batches/', AssosiatedBatchesView.as_view(), name='assosiated-batches'),
    path('user-session/<str:action>',SessionLogger.as_view(), name = 'sessionlogger'),
    path('get-spent-time-user', GetSpentTimeInfoUser.as_view(), name = 'Get Spent Time Info User'),
    path('set-new-password/', SetNewPassword.as_view(), name ='set new password'),
    path('celerytest/',CeleryTest.as_view())
]
