# Generated by Django 5.1.3 on 2024-11-25 04:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_alter_book_google_books_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='google_books_id',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]
