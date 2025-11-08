from django.contrib import admin
from support.models import ReportAnIssue

# Register your models here.
class ReportAnIssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'user', 'issue_description', 'created_on', 'resolved')
    list_filter = ('type', 'created_on')
    search_fields = ['user__username', 'issue_description']

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('user')
        return queryset

admin.site.register(ReportAnIssue, ReportAnIssueAdmin)