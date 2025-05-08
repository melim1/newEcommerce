from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    
    adresse = models.TextField(blank=True, null=True)
    tel =models.CharField(max_length=10, blank=True, null=True)
    def __str__(self):
        return self.username



