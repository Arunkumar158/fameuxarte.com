from django.db import models

# Create your models here.

class Artist(models.Model):
    name = models.CharField(max_length=200)
    bio = models.TextField()
    image = models.ImageField(upload_to='artists/')
    website = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name