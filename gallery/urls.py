from django.urls import path
from .views import GalleryImageListCreateView, GalleryImageRetrieveUpdateDestroyView

urlpatterns = [
    path('gallery/', GalleryImageListCreateView.as_view(), name='gallery-list-create'),
    path('gallery/<int:pk>/', GalleryImageRetrieveUpdateDestroyView.as_view(), name='gallery-detail'),
]
