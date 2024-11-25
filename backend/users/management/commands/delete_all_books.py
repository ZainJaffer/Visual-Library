from django.core.management.base import BaseCommand
from users.models import Book, UserBook

class Command(BaseCommand):
    help = 'Deletes all books and related user-book relationships from the database'

    def handle(self, *args, **options):
        # First delete all UserBook entries
        userbook_count = UserBook.objects.count()
        UserBook.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {userbook_count} UserBook entries'))

        # Then delete all Book entries
        book_count = Book.objects.count()
        Book.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {book_count} Book entries'))
