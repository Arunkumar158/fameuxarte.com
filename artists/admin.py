from django.contrib import admin
from .models import Artist

class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name', 'website')  # Show name & website in the admin panel
    search_fields = ('name', 'bio')  # Enable search by name & bio

admin.site.register(Artist, ArtistAdmin)