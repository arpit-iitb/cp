"""
Production Django settings for codingjudge project.
Inherits from base settings and overrides for production security.

Usage:
    Set environment variable: DJANGO_SETTINGS_MODULE=codingjudge.settings_production
    Or use in manage.py: python manage.py runserver --settings=codingjudge.settings_production
"""

from .settings import *
from decouple import config, Csv
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

# ============================================================================
# SECURITY SETTINGS - CRITICAL FOR PRODUCTION
# ============================================================================

# NEVER run with DEBUG=True in production!
DEBUG = False

# Enforce HTTPS
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# HTTP Strict Transport Security (HSTS)
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=31536000, cast=int)  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Additional Security Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS Settings - MUST be restrictive in production
CORS_ORIGIN_ALLOW_ALL = False
CORS_ALLOWED_ORIGINS = config('CORS_ORIGIN_WHITELIST', cast=Csv())
CORS_ALLOW_CREDENTIALS = True

# CSRF Settings
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', cast=Csv())
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'

# Session Security
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_SAVE_EVERY_REQUEST = True

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', default=5432, cast=int),
        'CONN_MAX_AGE': config('DB_CONN_MAX_AGE', default=600, cast=int),
        'CONN_HEALTH_CHECKS': config('DB_CONN_HEALTH_CHECKS', default=True, cast=bool),
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000',  # 30 seconds
        },
    }
}

# ============================================================================
# REDIS & CACHING
# ============================================================================

REDIS_PASSWORD = config('REDIS_PASSWORD')
REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}"

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': f'{REDIS_URL}/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            }
        },
        'KEY_PREFIX': 'codepaathshala',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Session backend using Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# ============================================================================
# CELERY CONFIGURATION
# ============================================================================

CELERY_BROKER_URL = f'{REDIS_URL}/0'
CELERY_RESULT_BACKEND = f'{REDIS_URL}/0'
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes hard limit
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60  # 25 minutes soft limit
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000  # Restart workers after 1000 tasks

# ============================================================================
# JWT TOKEN CONFIGURATION (Shorter lifetimes for production)
# ============================================================================

SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(
    minutes=config('ACCESS_TOKEN_LIFETIME_MINUTES', default=60, cast=int)
)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(
    days=config('REFRESH_TOKEN_LIFETIME_DAYS', default=7, cast=int)
)
SIMPLE_JWT['ROTATE_REFRESH_TOKENS'] = True
SIMPLE_JWT['BLACKLIST_AFTER_ROTATION'] = True

# ============================================================================
# STATIC & MEDIA FILES
# ============================================================================

# Option 1: Serve from Nginx (default)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'static'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Option 2: AWS S3 (uncomment if using S3)
# if config('USE_S3', default=False, cast=bool):
#     AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
#     AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
#     AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
#     AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
#     AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
#     AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
#     AWS_DEFAULT_ACL = 'public-read'
#
#     # Static files
#     STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
#     STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
#
#     # Media files
#     DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
#     MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'filters': ['require_debug_false'],
            'formatter': 'verbose'
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': config('LOG_LEVEL', default='INFO'),
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['mail_admins', 'file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['mail_admins', 'file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'celery': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
import os
os.makedirs(BASE_DIR / 'logs', exist_ok=True)

# ============================================================================
# EMAIL CONFIGURATION
# ============================================================================

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER)
SERVER_EMAIL = config('SERVER_EMAIL', default=EMAIL_HOST_USER)

# Admins to notify on errors
ADMINS = [
    ('Admin', config('ADMIN_EMAIL', default=EMAIL_HOST_USER)),
]
MANAGERS = ADMINS

# ============================================================================
# SENTRY ERROR TRACKING (Highly Recommended)
# ============================================================================

SENTRY_DSN = config('SENTRY_DSN', default=None)
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
        ],
        environment=config('SENTRY_ENVIRONMENT', default='production'),
        traces_sample_rate=config('SENTRY_TRACES_SAMPLE_RATE', default=0.1, cast=float),
        send_default_pii=False,  # Don't send PII to Sentry
        before_send=lambda event, hint: event if not DEBUG else None,
    )

# ============================================================================
# PERFORMANCE & OPTIMIZATION
# ============================================================================

# Database query optimization
CONN_MAX_AGE = 600

# Template caching
TEMPLATES[0]['OPTIONS']['loaders'] = [
    ('django.template.loaders.cached.Loader', [
        'django.template.loaders.filesystem.Loader',
        'django.template.loaders.app_directories.Loader',
    ]),
]

# ============================================================================
# ALLOWED HOSTS
# ============================================================================

ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=Csv())

# ============================================================================
# ADDITIONAL PRODUCTION SETTINGS
# ============================================================================

# Disable Django Debug Toolbar in production
if 'debug_toolbar' in INSTALLED_APPS:
    INSTALLED_APPS.remove('debug_toolbar')

if 'debug_toolbar.middleware.DebugToolbarMiddleware' in MIDDLEWARE:
    MIDDLEWARE.remove('debug_toolbar.middleware.DebugToolbarMiddleware')

# Data upload limits
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB

# Password validation (stricter in production)
AUTH_PASSWORD_VALIDATORS.append({
    'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    'OPTIONS': {
        'min_length': 12,
    }
})

print("🔒 Running in PRODUCTION mode with security hardening enabled")
