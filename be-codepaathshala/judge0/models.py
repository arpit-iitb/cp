from django.db import models
import uuid
import hashlib
from decouple import config
import jwt

# Generate API key with client information
def generate_api_key(client_id, client_name):
    payload = {
        'client_id': client_id,
        'client_name': client_name,
    }
    public_key = config('SECRET_KEY')
    header = {'typ': 'JWT', 'alg': 'HS256'}
    key = jwt.encode(payload, public_key, algorithm='HS256', headers=header)
    return key.decode('utf-8')


# Create your models here.
class CompilerClient(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True,blank=True)
    api_key = models.CharField(max_length=200, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.api_key:
            self.api_key =generate_api_key(self.id,self.name)           
            self.save()  # Save the object again to update the API key
    
    def __str__(self):
        return self.name
