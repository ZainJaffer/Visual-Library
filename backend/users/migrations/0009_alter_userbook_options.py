# Generated by Django 5.0.1 on 2024-11-24 21:30

from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0008_remove_book_is_manual_book_openlibrary_id_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='userbook',
            options={'ordering': ['-created_at']},
        ),
    ]