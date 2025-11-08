from django.urls import path

from discussions.views import DiscussionAPIView

urlpatterns = [
    path('', DiscussionAPIView.as_view(), name='get-create-discussions'),
]   