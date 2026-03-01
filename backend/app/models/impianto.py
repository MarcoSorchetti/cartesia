from pydantic import BaseModel, Field
from datetime import datetime


# ── Tag Schemas ──

class TagBase(BaseModel):
    nome: str = Field(..., max_length=50)
    colore: str | None = Field(default="#2563eb", max_length=7)


class TagCreate(TagBase):
    pass


class TagOut(TagBase):
    id: int

    class Config:
        orm_mode = True


# ── Impianto Schemas ──

class ImpiantoBase(BaseModel):
    codice: str = Field(..., max_length=50)
    nome: str = Field(..., max_length=200)
    tipo: str = Field(..., max_length=50)
    formato: str | None = None
    indirizzo: str | None = None
    citta: str = Field(..., max_length=100)
    provincia: str | None = Field(default=None, max_length=5)
    cap: str | None = Field(default=None, max_length=10)
    latitudine: float | None = None
    longitudine: float | None = None
    concessionario: str | None = None
    illuminato: bool = False
    digitale: bool = False
    facce: int = 1
    stato: str = Field(default="attivo", max_length=30)
    note: str | None = None
    foto_giorno: str | None = None
    foto_notte: str | None = None
    foto_frontale: str | None = None
    foto_contesto: str | None = None


class ImpiantoCreate(ImpiantoBase):
    tag_ids: list[int] = []


class ImpiantoUpdate(BaseModel):
    codice: str | None = None
    nome: str | None = None
    tipo: str | None = None
    formato: str | None = None
    indirizzo: str | None = None
    citta: str | None = None
    provincia: str | None = None
    cap: str | None = None
    latitudine: float | None = None
    longitudine: float | None = None
    concessionario: str | None = None
    illuminato: bool | None = None
    digitale: bool | None = None
    facce: int | None = None
    stato: str | None = None
    note: str | None = None
    foto_giorno: str | None = None
    foto_notte: str | None = None
    foto_frontale: str | None = None
    foto_contesto: str | None = None
    tag_ids: list[int] | None = None


class ImpiantoOut(ImpiantoBase):
    id: int
    tags: list[TagOut] = []
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        orm_mode = True
