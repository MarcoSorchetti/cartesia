import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_

from app.database import get_db
from app.models.impianto_sql import Impianto as ImpiantoModel
from app.models.tag_sql import Tag as TagModel
from app.models.impianto import (
    ImpiantoCreate,
    ImpiantoUpdate,
    ImpiantoOut,
    TagCreate,
    TagOut,
)

# Directory per i file caricati
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "../../../uploads/impianti")
os.makedirs(UPLOADS_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

router = APIRouter(
    prefix="/impianti",
    tags=["impianti"],
)

tag_router = APIRouter(
    prefix="/tags",
    tags=["tags"],
)


# ===========================================================================
# IMPIANTI — CRUD + Ricerca
# ===========================================================================


# ---------------------------------------------------------------------------
# Elenco impianti (con filtri opzionali)
# ---------------------------------------------------------------------------
@router.get("/", response_model=List[ImpiantoOut])
def lista_impianti(
    q: Optional[str] = None,
    tipo: Optional[str] = None,
    citta: Optional[str] = None,
    stato: Optional[str] = None,
    illuminato: Optional[bool] = None,
    digitale: Optional[bool] = None,
    tag: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(ImpiantoModel).options(joinedload(ImpiantoModel.tags))

    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(
                ImpiantoModel.nome.ilike(pattern),
                ImpiantoModel.codice.ilike(pattern),
                ImpiantoModel.indirizzo.ilike(pattern),
            )
        )

    if tipo:
        query = query.filter(ImpiantoModel.tipo == tipo)
    if citta:
        query = query.filter(ImpiantoModel.citta.ilike(f"%{citta}%"))
    if stato:
        query = query.filter(ImpiantoModel.stato == stato)
    if illuminato is not None:
        query = query.filter(ImpiantoModel.illuminato == illuminato)
    if digitale is not None:
        query = query.filter(ImpiantoModel.digitale == digitale)
    if tag:
        query = query.filter(ImpiantoModel.tags.any(TagModel.nome == tag))

    impianti = query.order_by(ImpiantoModel.id).all()
    seen = set()
    result = []
    for imp in impianti:
        if imp.id not in seen:
            seen.add(imp.id)
            result.append(imp)
    return result


# ---------------------------------------------------------------------------
# Dettaglio impianto
# ---------------------------------------------------------------------------
@router.get("/{impianto_id}", response_model=ImpiantoOut)
def dettaglio_impianto(impianto_id: int, db: Session = Depends(get_db)):
    impianto = (
        db.query(ImpiantoModel)
        .options(joinedload(ImpiantoModel.tags))
        .filter(ImpiantoModel.id == impianto_id)
        .first()
    )
    if not impianto:
        raise HTTPException(status_code=404, detail="Impianto non trovato.")
    return impianto


# ---------------------------------------------------------------------------
# Creazione nuovo impianto
# ---------------------------------------------------------------------------
@router.post("/", response_model=ImpiantoOut, status_code=201)
def crea_impianto(impianto: ImpiantoCreate, db: Session = Depends(get_db)):
    db_impianto = ImpiantoModel(
        codice=impianto.codice,
        nome=impianto.nome,
        tipo=impianto.tipo,
        formato=impianto.formato,
        indirizzo=impianto.indirizzo,
        citta=impianto.citta,
        provincia=impianto.provincia,
        cap=impianto.cap,
        latitudine=impianto.latitudine,
        longitudine=impianto.longitudine,
        concessionario=impianto.concessionario,
        illuminato=impianto.illuminato,
        digitale=impianto.digitale,
        facce=impianto.facce,
        stato=impianto.stato,
        note=impianto.note,
        foto_giorno=impianto.foto_giorno,
        foto_notte=impianto.foto_notte,
        foto_frontale=impianto.foto_frontale,
        foto_contesto=impianto.foto_contesto,
    )

    if impianto.tag_ids:
        tags = db.query(TagModel).filter(TagModel.id.in_(impianto.tag_ids)).all()
        db_impianto.tags = tags

    db.add(db_impianto)

    try:
        db.commit()
        db.refresh(db_impianto)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Codice impianto gia' presente nel sistema.",
        )

    return db_impianto


# ---------------------------------------------------------------------------
# Aggiornamento impianto
# ---------------------------------------------------------------------------
@router.put("/{impianto_id}", response_model=ImpiantoOut)
def aggiorna_impianto(
    impianto_id: int, impianto: ImpiantoUpdate, db: Session = Depends(get_db)
):
    db_impianto = (
        db.query(ImpiantoModel)
        .options(joinedload(ImpiantoModel.tags))
        .filter(ImpiantoModel.id == impianto_id)
        .first()
    )
    if not db_impianto:
        raise HTTPException(status_code=404, detail="Impianto non trovato.")

    update_data = impianto.dict(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)

    for field, value in update_data.items():
        setattr(db_impianto, field, value)

    if tag_ids is not None:
        tags = db.query(TagModel).filter(TagModel.id.in_(tag_ids)).all()
        db_impianto.tags = tags

    try:
        db.commit()
        db.refresh(db_impianto)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Codice impianto gia' presente nel sistema.",
        )

    return db_impianto


# ---------------------------------------------------------------------------
# Eliminazione impianto
# ---------------------------------------------------------------------------
@router.delete("/{impianto_id}")
def elimina_impianto(impianto_id: int, db: Session = Depends(get_db)):
    db_impianto = (
        db.query(ImpiantoModel).filter(ImpiantoModel.id == impianto_id).first()
    )
    if not db_impianto:
        raise HTTPException(status_code=404, detail="Impianto non trovato.")

    db.delete(db_impianto)
    db.commit()

    return {"detail": "Impianto eliminato con successo."}


# ---------------------------------------------------------------------------
# Upload foto impianto
# ---------------------------------------------------------------------------
@router.post("/upload-foto")
async def upload_foto(file: UploadFile = File(...)):
    # Validazione estensione
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato non supportato. Usa: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Leggi contenuto e controlla dimensione
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File troppo grande (max 10 MB).")

    # Genera nome unico
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOADS_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(content)

    return {"filename": unique_name, "url": f"/uploads/impianti/{unique_name}"}


# ===========================================================================
# TAGS — CRUD
# ===========================================================================


@tag_router.get("/", response_model=List[TagOut])
def lista_tags(db: Session = Depends(get_db)):
    return db.query(TagModel).order_by(TagModel.nome).all()


@tag_router.post("/", response_model=TagOut, status_code=201)
def crea_tag(tag: TagCreate, db: Session = Depends(get_db)):
    db_tag = TagModel(nome=tag.nome, colore=tag.colore)
    db.add(db_tag)

    try:
        db.commit()
        db.refresh(db_tag)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Tag con questo nome gia' esistente.",
        )

    return db_tag


@tag_router.delete("/{tag_id}")
def elimina_tag(tag_id: int, db: Session = Depends(get_db)):
    db_tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag non trovato.")

    db.delete(db_tag)
    db.commit()

    return {"detail": "Tag eliminato con successo."}
