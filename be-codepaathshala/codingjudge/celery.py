
import os
from celery import Celery
from django.conf import settings


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'codingjudge.settings')

# create celery instance
app = Celery('codingjudge')

# load the celery configurations 
app.config_from_object('django.conf:settings', namespace='CELERY')

# Look for celery tasks
app.autodiscover_tasks()

