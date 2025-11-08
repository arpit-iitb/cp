from django.contrib import admin
from .models import User, UserProfile, UserSessions, Otp
from django.contrib.auth.admin import UserAdmin

# Register your models here.
# @admin.register(User)
# class UserAdmin(admin.ModelAdmin):
#     list_filter = ('username', 'name', 'email')
#     list_display = ('username', 'name', 'email')

class CustomUserAdmin(UserAdmin):
    fieldsets = (
        ('Main', {
            'fields': ('username', 'email', 'password')
        }),
        ('Personal Info', {
            'fields': ('name', 'phone_number')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')
        }),
         ('Important Dates', {
            'fields': ('last_login',)
        }),
    )
    list_display = ('username', 'email', 'name', 'phone_number', 'is_active', 'is_staff', 'is_verified', 'created_at', 'updated_at')
    search_fields = ('username', 'email', 'name', 'phone_number')
    ordering = ('-created_at',)

    def save_model(self, request, obj, form, change):
        if 'password' in form.cleaned_data:
            obj.password = form.cleaned_data['password']
        obj.save()

admin.site.register(User, CustomUserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'client')
    list_filter = ('user','assosiatedbatches')
    filter_horizontal = ('solved_problems', 'watched_videos', 'assignment_Submission', 'assosiatedbatches', 'mcq_assignments')

@admin.register(UserSessions)
class UserSessions(admin.ModelAdmin):
    list_display = ('user', 'session_start', 'session_end', 'ended')
    search_field = ('user')
    list_filter  = ('user', 'session_start', 'session_end')

@admin.register(Otp)
class OtpAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp', 'creation_time')
    search_fields = ('user__username', 'otp')
    list_filter = ('creation_time',)