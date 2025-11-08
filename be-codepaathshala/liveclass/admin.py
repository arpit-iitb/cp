from django.contrib import admin
from .models import ZoomMeeting

@admin.register(ZoomMeeting)
class ZoomMeetingAdmin(admin.ModelAdmin):
    list_display = ('meeting_id', 'topic', 'parentbatch', 'start_time', 'duration', 'join_url', 'created_at')
    search_fields = ('meeting_id', 'topic', 'parentbatch__name')  # Assuming 'name' is a field in the Batch model
    list_filter = ('start_time', 'parentbatch')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {
            'fields': ('meeting_id', 'topic', 'parentbatch', 'start_time', 'duration', 'join_url')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at',)