from flask import Flask, request, jsonify, render_template, session, redirect, url_for
import sqlite3
from pathlib import Path
from datetime import datetime
from functools import wraps
from werkzeug.security import check_password_hash

app = Flask(__name__)
app.secret_key = "change-this-uruk-secret-key"

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "database" / "uruk.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/rooms", methods=["GET"])
def get_rooms():
    connection = get_db_connection()
    try:
        rooms = connection.execute("""
            SELECT id, name, description, capacity, price_per_hour, image
            FROM rooms
            WHERE is_active = 1
            ORDER BY id
        """).fetchall()
        return jsonify([dict(room) for room in rooms])
    finally:
        connection.close()


@app.route("/booking/<int:room_id>")
def booking_page(room_id):
    connection = get_db_connection()
    try:
        room = connection.execute("""
            SELECT id, name, description, capacity, price_per_hour, image
            FROM rooms
            WHERE id = ? AND is_active = 1
        """, (room_id,)).fetchone()
    finally:
        connection.close()

    if room is None:
        return "Room not found", 404

    return render_template("booking.html", room=room)


@app.route("/availability", methods=["GET"])
def check_availability():
    room_id = request.args.get("room_id")
    booking_date = request.args.get("date")
    start_time = request.args.get("start_time")
    end_time = request.args.get("end_time")

    if not all([room_id, booking_date, start_time, end_time]):
        return jsonify({"available": False, "message": "Room, date and time are required."}), 400

    try:
        start = datetime.strptime(start_time, "%H:%M")
        end = datetime.strptime(end_time, "%H:%M")
    except ValueError:
        return jsonify({"available": False, "message": "Invalid time format."}), 400

    if end <= start:
        return jsonify({"available": False, "message": "End time must be after start time."}), 400

    connection = get_db_connection()
    try:
        room = connection.execute(
            "SELECT id, name FROM rooms WHERE id = ? AND is_active = 1",
            (room_id,)
        ).fetchone()

        if room is None:
            return jsonify({"available": False, "message": "Room not found."}), 404

        conflict = connection.execute("""
            SELECT id FROM bookings
            WHERE room_id = ?
              AND booking_date = ?
              AND status != 'cancelled'
              AND start_time < ?
              AND end_time > ?
        """, (room_id, booking_date, end_time, start_time)).fetchone()

        if conflict:
            return jsonify({"available": False, "message": "This time is already booked."})

        return jsonify({"available": True, "message": "This time is available."})
    finally:
        connection.close()


@app.route("/bookings", methods=["POST"])
def create_booking():
    data = request.get_json(silent=True) or {}

    required = ["room_id", "customer_name", "phone", "email", "booking_date", "start_time", "end_time"]
    if not all(data.get(field) for field in required):
        return jsonify({"success": False, "message": "All booking fields are required."}), 400

    room_id = data["room_id"]
    customer_name = data["customer_name"].strip()
    phone = data["phone"].strip()
    email = data["email"].strip()
    booking_date = data["booking_date"]
    start_time = data["start_time"]
    end_time = data["end_time"]

    try:
        start = datetime.strptime(start_time, "%H:%M")
        end = datetime.strptime(end_time, "%H:%M")
        datetime.strptime(booking_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"success": False, "message": "Invalid date or time format."}), 400

    if end <= start:
        return jsonify({"success": False, "message": "End time must be after start time."}), 400

    duration = (end - start).seconds / 3600

    connection = get_db_connection()
    try:
        room = connection.execute("""
            SELECT * FROM rooms
            WHERE id = ? AND is_active = 1
        """, (room_id,)).fetchone()

        if room is None:
            return jsonify({"success": False, "message": "Room not found."}), 404

        conflict = connection.execute("""
            SELECT id FROM bookings
            WHERE room_id = ?
              AND booking_date = ?
              AND status != 'cancelled'
              AND start_time < ?
              AND end_time > ?
        """, (room_id, booking_date, end_time, start_time)).fetchone()

        if conflict:
            return jsonify({"success": False, "message": "This time is already booked."}), 409

        price_per_hour = float(room["price_per_hour"])
        total_price = round(duration * price_per_hour, 2)

        cursor = connection.execute("""
            INSERT INTO bookings (
                room_id, customer_name, phone, email,
                booking_date, start_time, end_time,
                duration, price_per_hour, total_price, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            room_id, customer_name, phone, email,
            booking_date, start_time, end_time,
            duration, price_per_hour, total_price, "confirmed"
        ))

        connection.commit()
        booking_id = cursor.lastrowid

        return jsonify({
            "success": True,
            "message": "Booking confirmed successfully.",
            "booking_id": booking_id,
            "room": room["name"],
            "date": booking_date,
            "start_time": start_time,
            "end_time": end_time,
            "duration": duration,
            "price_per_hour": price_per_hour,
            "total_price": total_price
        }), 201
    except Exception as error:
        connection.rollback()
        print("BOOKING ERROR:", error)
        return jsonify({"success": False, "message": "An error occurred while creating the booking."}), 500
    finally:
        connection.close()


# =====================================================
# ADMIN
# =====================================================

def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "admin_id" not in session:
            return redirect(url_for("admin_login"))
        return view(*args, **kwargs)
    return wrapped


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        connection = get_db_connection()
        try:
            admin = connection.execute(
                "SELECT id, username, password_hash FROM admins WHERE username = ?",
                (username,)
            ).fetchone()
        finally:
            connection.close()

        if admin and check_password_hash(admin["password_hash"], password):
            session["admin_id"] = admin["id"]
            session["admin_username"] = admin["username"]
            return redirect(url_for("admin_dashboard"))

        return render_template("admin_login.html", error="Invalid username or password.")

    return render_template("admin_login.html")


@app.route("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))


@app.route("/admin")
@admin_required
def admin_dashboard():
    connection = get_db_connection()
    try:
        rooms = connection.execute("""
            SELECT id, name, capacity, price_per_hour, is_active
            FROM rooms ORDER BY id
        """).fetchall()

        bookings = connection.execute("""
            SELECT
                b.id, b.customer_name, b.phone, b.email,
                b.booking_date, b.start_time, b.end_time,
                b.duration, b.price_per_hour, b.total_price, b.status,
                r.name AS room_name
            FROM bookings b
            JOIN rooms r ON r.id = b.room_id
            ORDER BY b.booking_date DESC, b.start_time DESC, b.id DESC
        """).fetchall()

        stats = {
            "bookings": connection.execute("SELECT COUNT(*) FROM bookings WHERE status != 'cancelled'").fetchone()[0],
            "rooms": connection.execute("SELECT COUNT(*) FROM rooms WHERE is_active = 1").fetchone()[0],
            "revenue": connection.execute("SELECT COALESCE(SUM(total_price),0) FROM bookings WHERE status != 'cancelled'").fetchone()[0],
            "customers": connection.execute("SELECT COUNT(DISTINCT phone) FROM bookings WHERE status != 'cancelled'").fetchone()[0],
        }
    finally:
        connection.close()

    return render_template(
        "admin.html",
        bookings=bookings,
        rooms=rooms,
        stats=stats,
        admin_username=session.get("admin_username", "Admin")
    )


@app.route("/admin/bookings/<int:booking_id>/cancel", methods=["POST"])
@admin_required
def cancel_booking(booking_id):
    connection = get_db_connection()
    try:
        connection.execute("UPDATE bookings SET status = 'cancelled' WHERE id = ?", (booking_id,))
        connection.commit()
    finally:
        connection.close()
    return redirect(url_for("admin_dashboard"))


if __name__ == "__main__":
    app.run(debug=True)
