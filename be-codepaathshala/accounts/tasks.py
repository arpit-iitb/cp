from codingjudge.celery import app  # Assuming you have imported `app` from your `celery.py` file
from utils.util import send_email
from django.utils import timezone
from datetime import timedelta
from .models import UserSessions

@app.task
def test_task():
    import time
    time.sleep(5)
    print("Task completed for data:")


@app.task
def celery_beat_test_task():
    # send_email()
    print("Celery beat is working")


@app.task
def delete_old_sessions():
    threshold_date = timezone.now() - timedelta(days = 60)
    UserSessions.objects.filter(session_end__lt=threshold_date).delete()
