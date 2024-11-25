# Generated by Django 5.0.1 on 2024-11-25 00:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_alter_userbook_options_book_created_at_and_more'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='userbook',
            name='users_userb_user_id_14fcc3_idx',
        ),
        migrations.AddField(
            model_name='userbook',
            name='is_reading',
            field=models.BooleanField(default=False),
        ),
        migrations.AddIndex(
            model_name='userbook',
            index=models.Index(fields=['user', 'is_read', 'is_reading', 'is_favorite'], name='users_userb_user_id_02a3e7_idx'),
        ),
    ]