from django.core.management.base import BaseCommand
from users.models import Book, UserBook, CustomUser
import requests
import os
import json

class Command(BaseCommand):
    help = 'Populates the database with sample books from Open Library'

    def handle(self, *args, **kwargs):
        # Clear existing books
        self.stdout.write('Clearing existing books and user associations...')
        Book.objects.all().delete()  # This will also delete associated UserBook entries due to CASCADE
        self.stdout.write(self.style.SUCCESS('Existing books cleared.'))

        # Create media directory if it doesn't exist
        media_root = 'media/book_covers'
        os.makedirs(media_root, exist_ok=True)

        # Clear existing book covers
        self.stdout.write('Clearing existing book covers...')
        for file in os.listdir(media_root):
            file_path = os.path.join(media_root, file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Failed to delete {file_path}: {str(e)}'))
        self.stdout.write(self.style.SUCCESS('Existing book covers cleared.'))

        self.stdout.write('Starting book population...')

        genres = [
            "Science Fiction", "Mystery", "Romance", "Fantasy",
            "Historical Fiction", "Thriller", "Horror", "Non-Fiction",
            "Adventure", "Biography"
        ]

        def fetch_book_details(work_id):
            """Fetch detailed book information including description"""
            try:
                url = f"https://openlibrary.org/works/{work_id}.json"
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()
                
                description = data.get('description', '')
                if isinstance(description, dict):
                    description = description.get('value', '')
                return description or ''
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Failed to fetch book details: {str(e)}"))
                return ''

        def fetch_books_with_covers_by_genre(genre, count=25):
            self.stdout.write(f"\nFetching {genre} books...")
            url = f"https://openlibrary.org/subjects/{genre.lower().replace(' ', '_')}.json?limit={count * 4}"
            
            try:
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()
                books = []
                skipped = 0

                for book in data.get('works', []):
                    if len(books) >= count:
                        break

                    title = book.get('title', '')
                    cover_id = book.get('cover_id')
                    work_id = book.get('key', '').split('/')[-1]  # Extract work_id from key

                    # Fetch detailed description
                    description = fetch_book_details(work_id)
                    if not description:
                        self.stdout.write(self.style.WARNING(f"Skipping '{title}': No description"))
                        skipped += 1
                        continue

                    # Validation checks with detailed logging
                    if not cover_id:
                        self.stdout.write(self.style.WARNING(f"Skipping '{title}': No cover image"))
                        skipped += 1
                        continue

                    authors = [author.get('name') for author in book.get('authors', [])]
                    if not authors:
                        self.stdout.write(self.style.WARNING(f"Skipping '{title}': No authors"))
                        skipped += 1
                        continue

                    # Download cover image
                    cover_url = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
                    cover_path = f"book_covers/{cover_id}.jpg"
                    full_cover_path = os.path.join(media_root, f"{cover_id}.jpg")

                    try:
                        img_response = requests.get(cover_url, stream=True)
                        img_response.raise_for_status()
                        
                        with open(full_cover_path, 'wb') as img_file:
                            for chunk in img_response.iter_content(1024):
                                img_file.write(chunk)

                        # Create Book object
                        book_obj = Book.objects.create(
                            title=title,
                            author=', '.join(authors),
                            genre=genre,
                            description=description,
                            cover_image_url=cover_path
                        )
                        books.append(book_obj)
                        self.stdout.write(self.style.SUCCESS(f"Created book: {title}"))

                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f"Failed to download cover for '{title}': {str(e)}")
                        )
                        continue

                self.stdout.write(f"Genre {genre}: Created {len(books)} books, Skipped {skipped} books")
                return books

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error fetching {genre} books: {str(e)}")
                )
                return []

        # Create books for each genre
        all_books = []
        for genre in genres:
            genre_books = fetch_books_with_covers_by_genre(genre)
            all_books.extend(genre_books)

        # Create UserBook entries for the first user
        try:
            user = CustomUser.objects.first()
            if user and all_books:
                for i, book in enumerate(all_books):
                    UserBook.objects.create(
                        user=user,
                        book=book,
                        is_read=i % 2 == 0,  # Alternate between read/unread
                        is_favorite=i % 3 == 0  # Every third book is a favorite
                    )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'\nSuccessfully created {len(all_books)} total books with user associations'
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING('No user found or no books created')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating user books: {str(e)}')
            )
