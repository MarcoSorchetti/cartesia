from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.cliente_sql import Cliente as ClienteModel
from app.models.cliente import Cliente as ClienteSchema, ClienteCreate

router = APIRouter(
    prefix="/clienti",
    tags=["clienti"],
)


# ---------------------------------------------------------------------------
# Elenco clienti
# ---------------------------------------------------------------------------
@router.get("/", response_model=List[ClienteSchema])
def lista_clienti(db: Session = Depends(get_db)):
    clienti = db.query(ClienteModel).order_by(ClienteModel.id).all()
    return clienti


# ---------------------------------------------------------------------------
# Dettaglio cliente
# ---------------------------------------------------------------------------
@router.get("/{cliente_id}", response_model=ClienteSchema)
def dettaglio_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(ClienteModel).filter(ClienteModel.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente non trovato.")
    return cliente


# ---------------------------------------------------------------------------
# Creazione nuovo cliente
# ---------------------------------------------------------------------------
@router.post("/", response_model=ClienteSchema, status_code=201)
def crea_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    db_cliente = ClienteModel(
        azienda=cliente.azienda,
        partita_iva=cliente.partita_iva,
        email=cliente.email,
        indirizzo=cliente.indirizzo,
        citta=cliente.citta,
        cap=cliente.cap,
        codice_univoco=cliente.codice_univoco,
        telefono=cliente.telefono,
    )

    db.add(db_cliente)

    try:
        db.commit()
        db.refresh(db_cliente)
    except IntegrityError:
        db.rollback()
        # Qui il caso tipico è la partita IVA duplicata
        raise HTTPException(
            status_code=400,
            detail="Partita IVA già presente per un altro cliente.",
        )

    return db_cliente


# ---------------------------------------------------------------------------
# Aggiornamento cliente esistente
# ---------------------------------------------------------------------------
@router.put("/{cliente_id}", response_model=ClienteSchema)
def aggiorna_cliente(
    cliente_id: int, cliente: ClienteCreate, db: Session = Depends(get_db)
):
    db_cliente = (
        db.query(ClienteModel).filter(ClienteModel.id == cliente_id).first()
    )
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente non trovato.")

    db_cliente.azienda = cliente.azienda
    db_cliente.partita_iva = cliente.partita_iva
    db_cliente.email = cliente.email
    db_cliente.indirizzo = cliente.indirizzo
    db_cliente.citta = cliente.citta
    db_cliente.cap = cliente.cap
    db_cliente.codice_univoco = cliente.codice_univoco
    db_cliente.telefono = cliente.telefono

    try:
        db.commit()
        db.refresh(db_cliente)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Partita IVA già presente per un altro cliente.",
        )

    return db_cliente


# ---------------------------------------------------------------------------
# Eliminazione cliente
# ---------------------------------------------------------------------------
@router.delete("/{cliente_id}")
def elimina_cliente(cliente_id: int, db: Session = Depends(get_db)):
    db_cliente = (
        db.query(ClienteModel).filter(ClienteModel.id == cliente_id).first()
    )
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente non trovato.")

    db.delete(db_cliente)
    db.commit()

    return {"detail": "Cliente eliminato con successo."}