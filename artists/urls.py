from django.urls import path
from .views import ArtistListCreateView, ArtistRetrieveUpdateDestroyView  # Ensure the name matches exactly

urlpatterns = [
    path('artists/', ArtistListCreateView.as_view(), name='artist-list-create'),
    path('artists/<int:pk>/', ArtistRetrieveUpdateDestroyView.as_view(), name='artist-detail'),
]
