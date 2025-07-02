from django.contrib import admin
from .models import GalleryImage

class GalleryAdmin(admin.ModelAdmin):
    list_display = ('title', 'uploaded_at')  # Show title & upload date
    search_fields = ('title', 'description')

admin.site.register(GalleryImage, GalleryAdmin)