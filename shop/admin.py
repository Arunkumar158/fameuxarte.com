from django.contrib import admin
from .models import Category, Product, Review

# Display category names in admin
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)

# Inline review editing inside the Product page
class ReviewInline(admin.TabularInline):  # or admin.StackedInline for a different layout
    model = Review
    extra = 1  # Number of empty forms to display

# Customizing Product Admin Panel
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'available', 'category')
    list_filter = ('available', 'category')
    search_fields = ('name', 'description')
    inlines = [ReviewInline]  # This will allow adding/editing reviews directly inside products

# Register models with custom admin settings
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Review)
