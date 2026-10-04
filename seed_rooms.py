import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "database" / "uruk.db"

rooms = [
    ("Small Room", "A private space for focused individual study or a small study session.", 2, 2.00, "images/teaching-room.jpeg"),
    ("Study Room", "A comfortable room for small study groups and collaborative work.", 4, 4.00, "images/public-area.jpeg"),
    ("Group Room", "A practical space for group study, projects and discussions.", 6, 4.00, "images/lounge.jpeg"),
    ("Large Study Room", "More space for larger study groups, meetings and academic sessions.", 12, 6.00, "images/uruk-interior.jpeg"),
    ("Group Space", "A larger space for group projects, workshops and collaborative sessions.", 22, 8.00, "images/hero-image.jpeg"),
    ("Event & Lecture Room", "A spacious room suitable for lectures, workshops, events and large groups.", 50, 10.00, "images/teaching-room.jpeg"),
]

connection = sqlite3.connect(DATABASE_PATH)
for room in rooms:
    connection.execute("""
        INSERT INTO rooms (name, description, capacity, price_per_hour, image, is_active)
        SELECT ?, ?, ?, ?, ?, 1
        WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = ?)
    """, (*room, room[0]))
connection.commit()
connection.close()
print("Rooms setup completed successfully!")
