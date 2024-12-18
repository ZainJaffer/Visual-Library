# Generated by Django 5.0.1 on 2024-11-24 02:13

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0006_alter_book_cover_image_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="book",
            name="cover_image",
            field=models.ImageField(blank=True, null=True, upload_to="book_covers/"),
        ),
        migrations.AddField(
            model_name="book",
            name="google_books_id",
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="book",
            name="is_manual",
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name="book",
            name="author",
            field=models.CharField(max_length=500),
        ),
        migrations.AlterField(
            model_name="book",
            name="cover_image_url",
            field=models.URLField(blank=True, max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name="book",
            name="description",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="book",
            name="genre",
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name="book",
            name="title",
            field=models.CharField(max_length=500),
        ),
        migrations.AddIndex(
            model_name="userbook",
            index=models.Index(
                fields=["user", "is_read", "is_favorite"],
                name="users_userb_user_id_14fcc3_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="userbook",
            index=models.Index(
                fields=["user", "book"], name="users_userb_user_id_440206_idx"
            ),
        ),
    ]
