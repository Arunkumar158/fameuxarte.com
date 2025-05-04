from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import About
from .serializers import AboutSerializer

# HTML view
def about(request):
    return render(request, 'about/about.html')

# API view
@api_view(['GET'])
def AboutView(request):
    about = About.objects.first()  # Get the first about section entry
    if about:
        serializer = AboutSerializer(about)
        return Response(serializer.data)
    return Response({"message": "No about section found."}, status=404)  # ✅ Fixed