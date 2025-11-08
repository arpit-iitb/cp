import base64
import json
import os
import traceback
from urllib import parse
from decouple import config
import jwt
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from accounts.models import User, UserProfile
from django.utils import timezone


class CJAuthentication(authentication.BaseAuthentication):

    def getLoggedIn(self, request, token):
        payload = {}

        public_key = config('SECRET_KEY')
        try:
            payload = jwt.decode(token.encode('utf-8'),public_key, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return payload
        except Exception :
            return payload

        return payload
        
    def authenticate(self, request):
        # get the username request header
        token = request.headers.get('Authorization')
        request.user = {}
        isLoggedIn = self.getLoggedIn(request, token) if token else False
        if isLoggedIn:
            request.user['id'] = isLoggedIn.get('user_id')
        try:
            user = User.objects.get(id = request.user['id'])
            user_profile = UserProfile.objects.get(user=user)
            user_profile.last_login= timezone.now()
            user_profile.save(update_fields=['last_login'])
        except:
            print("Error in LoggingUser time in authentication.py")
        return (request.user, None)  # authentication successful


class CompilerAuthentication(authentication.BaseAuthentication):

    def getLoggedIn(self, request, token):
        payload = {}
        public_key = config('SECRET_KEY')

        try:
            payload = jwt.decode(token,public_key, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Authentication Failed')
        except Exception as e:
            raise AuthenticationFailed('Authentication Failed')

        return payload
        
    def authenticate(self, request):
        # get the username request header
        api_key = request.headers.get('Authorization')
        request.user = {}
        isLoggedIn = self.getLoggedIn(request, api_key) if api_key else False
        if isLoggedIn:
            request.user['id'] = isLoggedIn.get('user_id')
        return (request.user, None)  # authentication successful