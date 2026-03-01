from sqlalchemy import Column, Integer, String
from app.database import Base

class Cliente(Base):
    __tablename__ = "clienti"
    id = Column(Integer, primary_key=True, index=True)
    azienda = Column(String, index=True)
    partita_iva = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    indirizzo = Column(String, nullable=True)
    citta = Column(String, nullable=True)
    cap = Column(String, nullable=True)
    codice_univoco = Column(String, nullable=False)
    telefono = Column(String(20), nullable=True)
