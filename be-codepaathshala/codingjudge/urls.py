"""
URL configuration for codingjudge project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
import debug_toolbar

urlpatterns = [
    path("admin/", admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('compiler/', include('judge0.urls')),
    path('__debug__/', include(debug_toolbar.urls)),
    path('', include('apis.urls')),
    path('submit/', include('submissions.urls')),
    path('api/discussions/',include('discussions.urls')),
    path('api/support/',include('support.urls')),
    path('api/admin/',include('admin_dashboard.urls')),
    path('api/assessment_V2/', include('assessment_V2.urls')),
    path('api/liveclasses/',include('liveclass.urls'))
]
