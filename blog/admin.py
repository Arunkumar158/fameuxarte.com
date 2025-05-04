from django.contrib import admin
from .models import Post, Category, Tag, Comment

# Category Admin
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

# Tag Admin
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

# Comment Inline for Post Admin
class CommentInline(admin.TabularInline):  # Can also use `admin.StackedInline`
    model = Comment
    extra = 1  # Number of empty comment fields to show

# Post Admin
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'published_at')
    list_filter = ('author', 'created_at', 'published_at')
    search_fields = ('title', 'content', 'author__username')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-published_at',)
    inlines = [CommentInline]  # Allows adding comments inside the post admin page

# Comment Admin
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'email', 'created_at', 'approved')
    list_filter = ('approved', 'created_at')
    search_fields = ('author', 'email', 'body')
    actions = ['approve_comments']
