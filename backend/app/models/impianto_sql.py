from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class Impianto(Base):
    __tablename__ = "impianti"

    id = Column(Integer, primary_key=True, index=True)
    codice = Column(String(50), unique=True, nullable=False, index=True)
    nome = Column(String(200), nullable=False, index=True)
    tipo = Column(String(50), nullable=False, index=True)
    formato = Column(String(100), nullable=True)
    indirizzo = Column(String(300), nullable=True)
    citta = Column(String(100), nullable=False, index=True)
    provincia = Column(String(5), nullable=True)
    cap = Column(String(10), nullable=True)
    latitudine = Column(Float, nullable=True)
    longitudine = Column(Float, nullable=True)
    concessionario = Column(String(200), nullable=True)
    illuminato = Column(Boolean, nullable=False, server_default="false")
    digitale = Column(Boolean, nullable=False, server_default="false")
    facce = Column(Integer, nullable=False, server_default="1")
    stato = Column(String(30), nullable=False, server_default="'attivo'")
    note = Column(Text, nullable=True)

    # Foto (path relativi alla cartella uploads/)
    foto_giorno = Column(String(500), nullable=True)
    foto_notte = Column(String(500), nullable=True)
    foto_frontale = Column(String(500), nullable=True)
    foto_contesto = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    tags = relationship("Tag", secondary="impianto_tags", back_populates="impianti")
