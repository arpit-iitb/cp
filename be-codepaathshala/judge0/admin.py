from django.contrib import admin
from .models import CompilerClient
# Register your models here.
@admin.register(CompilerClient)
class CompilerClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'api_key', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'api_key')