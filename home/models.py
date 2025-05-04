from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.

class Banner(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='banners/')
    alt_text = models.CharField(max_length=255, blank=True, null=True, help_text="Alternative text for the image(for accessibility)") # Alt text for accessibility
    description = models.TextField(blank=True, null=True) # Description can be ooptional
    link_url = models.URLField(blank=True, null=True, help_text="URL to link the banner to ") # URL to link the banner
    is_active = models.BooleanField(default=True)
    start_date = models.DateField(blank=True, null=True, help_text="Date when the banner starts showing") # Optional start date
    end_date = models.DateField(blank=True, null=True, help_text="Date when the banner stops showing") # Optional end date

    def __str__(self):
        return self.title
    
    

# Other Considerations:

# Multiple Banners: If you want to display multiple banners on the home page, 
# you'll need to query the Banner model in your view and loop through the banners in your template.

# Banner Rotator/Carousel: For a rotating banner display, you'll likely want 
# to use JavaScript (or a library) to create a carousel or slider effect.

# Banner Types: If you have different types of banners (e.g., full-width banners, sidebar banners), 
# you might consider adding a banner_type field to the model.


# Admin Customization: Customize the Django admin for the Banner model to make it easier to manage banners. 
# You can use list_display, list_filter, and other options in your admin.py file.


