"""
JB Consulenti Gestionale - Endpoint API Gestione Utenti

Team sviluppo: Gia.Mar Srl - Marco Sorchetti
Responsabile tecnico: Marco Sorchetti

Scopo:
- Esporre le API REST per la gestione degli utenti applicativi.
- Fornire operazioni CRUD su utenti (lista, creazione, aggiornamento, eliminazione).

NOTE:
- Utilizza il modello ORM User (app.models.user_sql) e gli schemi Pydantic in app.models.user.
- La password in input viene sempre convertita in `password_hash` tramite app.core.security.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_sql import User
from app.models.user import UserCreate, UserUpdate, UserOut
from app.core.security import get_password_hash


router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("/", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)) -> List[UserOut]:
    """
    Restituisce la lista completa degli utenti.

    TODO futuro:
    - Aggiungere paginazione (skip/limit) se necessario.
    """
    users = db.query(User).all()
    return users


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
) -> UserOut:
    """
    Restituisce il dettaglio di un singolo utente per ID.
    """
    user: Optional[User] = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato.",
        )
    return user


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> UserOut:
    """
    Crea un nuovo utente.

    Regole:
    - username deve essere univoco (può essere una mail).
    - la password viene hashata in `password_hash`.
    - l'utente è attivo di default (is_active = TRUE in DB).
    """

    # Controllo unicità username
    existing_username = db.query(User).filter(User.username == user_in.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username già esistente.",
        )

    db_user = User(
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        # is_active e created_at usano i default del DB
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
) -> UserOut:
    """
    Aggiorna un utente esistente.

    Aggiorna solo:
    - username
    - password
    - is_active
    """

    user: Optional[User] = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato.",
        )

    # Username
    if user_in.username and user_in.username != user.username:
        existing_username = (
            db.query(User)
            .filter(User.username == user_in.username, User.id != user_id)
            .first()
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username già esistente.",
            )
        user.username = user_in.username

    # Password
    if user_in.password:
        user.password_hash = get_password_hash(user_in.password)

    # is_active
    if user_in.is_active is not None:
        user.is_active = user_in.is_active

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
) -> None:
    """
    Elimina un utente esistente.

    TODO futuro:
    - Valutare soft-delete (flag is_active/archived) invece di cancellazione fisica.
    """
    user: Optional[User] = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato.",
        )

    db.delete(user)
    db.commit()
    return None
