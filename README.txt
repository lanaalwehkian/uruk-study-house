URUK BOOKING SYSTEM - FINAL SETUP

1) Keep this structure:
   app.py
   db_setup.py
   seed_rooms.py
   setup_admin.py
   templates/index.html
   templates/booking.html
   templates/admin_login.html
   templates/admin.html
   static/style.css
   static/script.js
   static/images/...
   database/uruk.db

2) In the project terminal:
   python db_setup.py
   python seed_rooms.py
   python setup_admin.py
   python app.py

3) Website:
   http://127.0.0.1:5000/

4) Admin:
   http://127.0.0.1:5000/admin/login

The room buttons are linked to /booking/1 through /booking/6.
The same database is used by the website, booking page, and admin dashboard.
