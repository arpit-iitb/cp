from django.contrib import admin

from .models import Discussion

@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ('type', 'user', 'likes', 'created_on', 'problem', 'video', 'assignment', 'mcq_assignment', 'batch')
    list_filter = ('type', 'user', 'created_on')
    search_fields = ('user__username', 'discussion_text')
