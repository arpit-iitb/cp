from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext as _

class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """

    def create_user(self, email, username, password, **extra_fields):
        """Creates and saves a new user"""
        if not email:
            raise ValueError("Users must have a email")
        user = self.model(email=email,username=username,**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username,password):
        """Creates and saves a new super user"""
        user = self.create_user(email, username,password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user