from rest_framework import generics
from .models import Artist
from .serializers import ArtistSerializer

# List & Create Artists
class ArtistListCreateView(generics.ListCreateAPIView):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer

# Retrieve, Update & Delete a Single Artist (Corrected Name)
class ArtistRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
