from django.urls import path
from . import views

urlpatterns = [
    # path('create-zoom-meeting/', views.create_zoom_meeting, name='create_zoom_meeting'),
    path('upcoming-classes', views.UpcomingClassView.as_view(), name='upcoming_classes')
]