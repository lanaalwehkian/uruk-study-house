import sqlite3
from pathlib import Path
from getpass import getpass
from werkzeug.security import generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "database" / "uruk.db"

username = input("Admin username: ").strip()
email = input("Admin email: ").strip()
password = getpass("Admin password: ")

if not username or not email or not password:
    raise SystemExit("All fields are required.")

connection = sqlite3.connect(DATABASE_PATH)
connection.execute("""
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

connection.execute("""
    INSERT INTO admins (username, email, password_hash)
    VALUES (?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
        email = excluded.email,
        password_hash = excluded.password_hash
""", (username, email, generate_password_hash(password)))
connection.commit()
connection.close()
print("Admin account is ready.")
