from rest_framework import generics
from .models import GalleryImage
from .serializers import GalleryImageSerializer

# List & Create Gallery Images
class GalleryImageListCreateView(generics.ListCreateAPIView):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer

# Retrieve, Update & Delete a Single Gallery Image
class GalleryImageRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
