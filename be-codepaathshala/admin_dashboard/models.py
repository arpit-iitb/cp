from django.db import models

class AdminActions(models.Model):
    time             = models.DateTimeField(auto_now_add=True)
    admin_name       = models.CharField(max_length=255)
    action           = models.CharField(max_length=50)
    user_name        = models.CharField(max_length=50)
    request_payload  = models.TextField(default="")
    
    def __str__(self):
        return f'{self.time} - {self.admin_name} - {self.action} - {self.user_name} - {self.request_payload}'

    class Meta:
        ordering = ['-time']
        verbose_name = 'Admin Action'
        verbose_name_plural = 'Admin Actions'


# Types of ACTIONS
# CREATED_USER
# DELETED_USER
# UPDATED_USER
# CHANGE_PASSWORD