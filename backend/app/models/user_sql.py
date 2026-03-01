from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from app.database import Base


class User(Base):
    """
    Modello ORM per la tabella `users`.

    Campi:
    - id: PK incrementale.
    - username: identificativo univoco per il login (può essere una mail).
    - password_hash: hash della password.
    - is_active: flag per abilitare/disabilitare l'accesso.
    - created_at: timestamp di creazione record.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(50), unique=True, nullable=False, index=True)

    # Password sempre memorizzata come hash
    password_hash = Column(String(255), nullable=False)

    # Stato utente
    is_active = Column(Boolean, nullable=False, server_default="true")

    # Audit
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
