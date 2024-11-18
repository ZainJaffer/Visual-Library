# Generated by Django 5.1.3 on 2024-11-08 21:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('author', models.CharField(max_length=255)),
                ('genre', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('cover_image_url', models.URLField(blank=True, max_length=500)),
            ],
        ),
    ]