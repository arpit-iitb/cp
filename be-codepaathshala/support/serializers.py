from rest_framework import serializers
from .models import ReportAnIssue

class ReportAnIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportAnIssue
        fields = '__all__'