"""
================================================================================
Cartesia - Backend API
File: main.py
Versione: 1.0.1
Autore: Team Gia.Mar Srl
Responsabile Progetto
Marco Sorchetti
Descrizione:
    Entry point dell'applicazione FastAPI.

Responsabilità:
    - Inizializzazione applicazione
    - Configurazione CORS
    - Registrazione routers
    - Bootstrap iniziale database (solo in ambiente dev)

Note Architetturali:
    - La creazione automatica delle tabelle tramite
      Base.metadata.create_all() è TEMPORANEA.
      In ambiente produzione si utilizzerà esclusivamente Alembic.
================================================================================
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Routers
from app.routers import hello
from app.routers.cliente import router as cliente_route
from app.routers.auth import router as auth_router
from app.routers.impianto import router as impianto_router, tag_router
from app.api.v1.endpoints import users as users_router

# Database
from app.database import Base, engine


# ------------------------------------------------------------------------------
# Inizializzazione applicazione
# ------------------------------------------------------------------------------
app = FastAPI(
    title="Cartesia API",
    version="1.0.1",
    description="Backend API — Gestione Cartelli Fisici e Digitali"
)


# ------------------------------------------------------------------------------
# Configurazione CORS
# ------------------------------------------------------------------------------
# CORS: consente accesso locale + dominio Render
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Registrazione Routers (prefisso /api per evitare conflitti con StaticFiles)
# ------------------------------------------------------------------------------
app.include_router(hello.router, prefix="/api")
app.include_router(cliente_route, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(users_router.router, prefix="/api")
app.include_router(impianto_router, prefix="/api")
app.include_router(tag_router, prefix="/api")


# ------------------------------------------------------------------------------
# Bootstrap Database (DEV ONLY)
# ------------------------------------------------------------------------------
# In produzione verrà rimosso: si userà Alembic
Base.metadata.create_all(bind=engine)


# ------------------------------------------------------------------------------
# Health Check (per Render)
# ------------------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {"status": "ok"}


# ------------------------------------------------------------------------------
# Servire Frontend come file statici
# ------------------------------------------------------------------------------
# Servire file uploads (foto impianti, ecc.)
uploads_dir = os.path.join(os.path.dirname(__file__), "../../uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# IMPORTANTE: il mount statico va DOPO i router API, così le rotte API hanno priorità
frontend_dir = os.path.join(os.path.dirname(__file__), "../../frontend")
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
