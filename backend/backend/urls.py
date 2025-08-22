"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from api.views import TagViewSet, NoteViewSet, TaskViewSet, CalendarView, TaskStatsView, UserView, login_view, register_view, logout_view, user_profile_view

router = DefaultRouter()
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'users', UserView, basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', login_view, name='login'),
    path('api/logout/', logout_view, name='logout'),
    path('api/register/', register_view, name='register'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', user_profile_view, name='user_profile'),
    path('api/tasks/stats/', TaskStatsView.as_view(), name='task-stats'),
    path('api/calendar/', CalendarView.as_view(), name='calendar'),
    path('api/', include(router.urls)),
]
