"""
JB Consulenti Gestionale - Schemi Pydantic User

Team sviluppo: Gia.Mar Srl - Marco Sorchetti
Responsabile tecnico: Marco Sorchetti

Scopo:
- Definire i modelli Pydantic per la validazione dei dati utente.
- Gestire input (creazione/aggiornamento) e output (lettura) degli utenti via API.

NOTE:
- Questi schemi sono separati dal modello ORM SQLAlchemy (app/models/user_sql.py).
- Il campo `password` esiste solo in input (create/update) e non viene mai restituito in output.
"""

from typing import Optional

from pydantic import BaseModel, Field


class UserBase(BaseModel):
    """
    Dati comuni dell'utente.
    - username: identificativo univoco per il login (può essere una mail).
    - is_active: stato dell'utente.
    """
    username: str = Field(..., max_length=50)
    is_active: bool = True


class UserCreate(UserBase):
    """
    Dati richiesti per la creazione di un nuovo utente.
    La password viene fornita in chiaro e sarà hashata a livello di servizio.
    """
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """
    Dati opzionali per aggiornare un utente esistente.
    Solo i campi valorizzati verranno aggiornati.
    """
    username: Optional[str] = Field(None, max_length=50)
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None


class UserOut(UserBase):
    """
    Modello di risposta API per la lettura utente.
    Non include mai la password né il relativo hash.
    """
    id: int

    class Config:
        orm_mode = True
