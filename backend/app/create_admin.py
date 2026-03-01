"""
Script una-tantum per creare un utente admin nel database.

Esegue:
- Connessione al DB tramite SessionLocal
- Controllo esistenza utente 'admin'
- Creazione utente admin con password 'Admin123!' se non esiste
"""

from passlib.hash import pbkdf2_sha256

from app.database import SessionLocal
from app.models.user_sql import User


def main():
    db = SessionLocal()
    try:
        username = "admin"
        password_plaintxt = "Admin123!"

        # Controlla se esiste già
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"Utente '{username}' già esistente (id={existing.id}). Nessuna modifica.")
            return

        # Calcola l'hash della password
        password_hash = pbkdf2_sha256.hash(password_plaintxt)

        # Crea nuovo utente
        user = User(
            username=username,
            password_hash=password_hash,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"Creato utente admin: username='{username}', id={user.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
