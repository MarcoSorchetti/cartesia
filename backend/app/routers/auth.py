"""
Router Autenticazione - JB Consulenti Gestionale

Responsabilità:
- Espone l'endpoint di login per gli utenti.
- Verifica le credenziali contro la tabella `users`.
- Restituisce un token di accesso (per ora dummy) e informazioni base sull'utente.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_sql import User
from app.schemas.auth import LoginRequest, LoginResponse
from app.core.security import verify_password  # ✅ usa lo stesso algoritmo di create_user


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Esegui login utente",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """
    Effettua il login di un utente.

    Passi:
    1. Cerca l'utente per username.
    2. Verifica che l'utente esista e sia attivo.
    3. Verifica la password confrontando l'hash salvato.
    4. Restituisce un token (dummy) + informazioni utente.
    """

    # 1. Cerca l'utente per username
    user = (
        db.query(User)
        .filter(User.username == payload.username)
        .first()
    )

    # 2. Utente non trovato o disattivato
    if not user or not getattr(user, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenziali non valide",
        )

    # 3. Verifica della password (stesso algoritmo di app.core.security)
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenziali non valide",
        )

    # 4. Login riuscito
    # Token fittizio per ora (da sostituire con JWT in futuro)
    access_token = "TEMP_TOKEN_ADMIN"

    # Flag admin: se il modello non ha is_admin, default = False
    is_admin = bool(getattr(user, "is_admin", False))

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        username=user.username,
        is_admin=is_admin,
    )
