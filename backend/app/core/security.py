"""
JB Consulenti Gestionale - Sicurezza e hashing password

Team sviluppo: Gia.Mar Srl - Marco Sorchetti
Responsabile tecnico: Marco Sorchetti

Scopo:
- Fornire funzioni centralizzate per l'hashing e la verifica delle password.
- Utilizzare un algoritmo sicuro (es. bcrypt) tramite passlib.

NOTE:
- Questo modulo non gestisce logica di login o token JWT; si occupa solo di hashing/verifica.
- Le password vengono sempre ricevute in chiaro dall'API e convertite in `password_hash`
  prima di essere salvate nel modello SQLAlchemy User.
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Restituisce l'hash sicuro della password in chiaro."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se la password in chiaro corrisponde all'hash salvato."""
    return pwd_context.verify(plain_password, hashed_password)
