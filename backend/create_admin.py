"""
Script per creare l'utente admin iniziale.

Uso:
  cd backend && python create_admin.py

Legge DATABASE_URL dall'ambiente (oppure usa il default locale).
Se l'utente admin esiste già, non fa nulla.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.user_sql import User
from app.core.security import get_password_hash

# Crea le tabelle se non esistono
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    existing = db.query(User).filter(User.username == "admin").first()
    if existing:
        print("Utente admin già esistente — nessuna modifica.")
    else:
        admin = User(
            username="admin",
            password_hash=get_password_hash("Admin123!"),
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("Utente admin creato con successo! (username: admin, password: Admin123!)")
finally:
    db.close()
