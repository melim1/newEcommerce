from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register your models here.

class Admin(UserAdmin):
    add_fieldsets = (
        (None,{
            'classes' : ('wide',),
            'fields' : ('username', 'email' , 'first_name' 'last_name', 'password1','password2', 'adresse','tel','is_staff','is_active')
        }

        ),
    )
admin.site.register(User,Admin)    
