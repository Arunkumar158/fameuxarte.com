from django.urls import path
from .views import AboutView

urlpatterns = [
      path('api/about/', AboutView, name='about_api'),
]