# Generated by Django 5.1.7 on 2025-04-08 18:56

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop_app', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cart',
            name='User',
        ),
        migrations.AddField(
            model_name='cart',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='shop_app.client'),
        ),
    ]
