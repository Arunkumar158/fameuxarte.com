from django.urls import path
from . import views

urlpatterns = [
    path('signin/', views.login_view, name='signin'),
    path('signup/', views. logout_view, name='signup'),
    path('register/', views.register, name='register'),
]