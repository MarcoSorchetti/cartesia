from pydantic import BaseModel

class ClienteBase(BaseModel):
    azienda: str
    partita_iva: str
    email: str | None = None
    indirizzo: str | None = None
    citta: str | None = None
    cap: str | None = None
    codice_univoco: str
    telefono: str | None = None 

class ClienteCreate(ClienteBase):
    pass

class Cliente(ClienteBase):
    id: int

    class Config:
        orm_mode = True

