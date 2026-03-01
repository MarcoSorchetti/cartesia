from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    """
    Schema di risposta per il login.

    Campi:
    - access_token: token di accesso (per ora dummy, in futuro JWT).
    - token_type: tipo di token (es. "bearer").
    - username: username effettivo dell'utente loggato.
    - is_admin: flag che indica se l'utente ha permessi amministrativi.
    """

    access_token: str
    token_type: str = "bearer"
    username: str
    is_admin: bool = False
