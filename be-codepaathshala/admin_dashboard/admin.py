from django.contrib import admin
from .models import AdminActions

@admin.register(AdminActions)
class AdminActions(admin.ModelAdmin):
    list_display  = ('time', 'admin_name', 'action', 'user_name', 'request_payload')
    search_fields = ('admin_name', 'user_name', 'action')
    list_filter   = ('time', 'admin_name', 'user_name')
