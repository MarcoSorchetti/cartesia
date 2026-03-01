# Cartesia — Documentazione Piattaforma

## Gestione Cartelli Fisici e Digitali

**Versione:** 1.0.1
**Data:** Marzo 2026
**Sviluppato da:** Gia.Mar Srl — Responsabile Progetto Marco Sorchetti

---

## 1. Cos'e' Cartesia

Cartesia e' una piattaforma web per la gestione degli impianti pubblicitari (cartelli fisici e digitali). Permette di catalogare, ricercare e gestire tutti gli impianti con un'interfaccia moderna e intuitiva.

La piattaforma e' accessibile da qualsiasi dispositivo dotato di browser (PC, tablet, smartphone) senza necessita' di installare software.

---

## 2. Come accedere

### URL della piattaforma

**https://jb-consulenti.onrender.com**

### Credenziali di accesso

| Campo | Valore |
|-------|--------|
| **Username** | `admin` |
| **Password** | `Admin123!` |

> **Nota:** Al primo accesso dopo un periodo di inattivita' (circa 15 minuti), la piattaforma potrebbe impiegare 30-40 secondi per avviarsi. Questo e' normale e dipende dal piano di hosting utilizzato.

### Procedura di login

1. Aprire il browser e andare all'URL indicato sopra
2. Inserire username e password
3. Cliccare su "Accedi"
4. Si viene reindirizzati alla Home Page della piattaforma

---

## 3. Struttura della piattaforma

### Home Page

La pagina iniziale mostra:
- Il nome della piattaforma **Cartesia**
- Il sottotitolo "Gestione Cartelli Fisici e Digitali"
- Il logo aziendale
- Il nome dell'utente collegato e la versione
- Due pulsanti rapidi per accedere alle sezioni principali:
  - **Gestione Clienti**
  - **Gestione Impianti**

### Barra laterale (Sidebar)

La barra di navigazione a sinistra contiene:

| Voce | Funzione |
|------|----------|
| **Home** | Torna alla pagina iniziale |
| **Gestione Clienti** | Anagrafica clienti |
| **Gestione Utenti** | Amministrazione utenti della piattaforma |
| **Fatturazione** | In fase di sviluppo (prossimamente) |
| **Gestione Impianti** | Catalogo impianti pubblicitari |

In basso nella sidebar sono visibili:
- L'utente attualmente collegato
- Il pulsante **Esci** per il logout

---

## 4. Funzionalita' attuali

### 4.1 Gestione Clienti

Permette di:
- Visualizzare l'elenco dei clienti in una tabella
- Aggiungere un nuovo cliente
- Modificare i dati di un cliente esistente
- Eliminare un cliente

### 4.2 Gestione Utenti

Permette di:
- Visualizzare gli utenti che hanno accesso alla piattaforma
- Creare nuovi utenti
- Modificare username e password degli utenti
- Disattivare o eliminare utenti

### 4.3 Gestione Impianti Pubblicitari

Questo e' il modulo principale della piattaforma. Permette di gestire l'intero catalogo degli impianti pubblicitari.

#### Vista Elenco

La pagina mostra una tabella con tutti gli impianti registrati, con le seguenti colonne:
- **Codice** — identificativo univoco dell'impianto
- **Nome** — descrizione dell'impianto
- **Tipo** — tipologia (billboard, poster, schermo digitale, pensilina, arredo urbano, altro)
- **Formato** — dimensioni fisiche (es. 6x3m)
- **Citta'** — localizzazione
- **Concessionario** — societa' proprietaria/concessionaria
- **Stato** — stato operativo (attivo, manutenzione, temporaneamente offline, dismesso)
- **Foto** — numero di foto associate all'impianto
- **Azioni** — pulsanti per modificare o eliminare

#### Filtri di ricerca

Sopra la tabella sono disponibili filtri per cercare rapidamente gli impianti:
- **Ricerca testo** — cerca per nome, codice o indirizzo
- **Tipo** — filtra per tipologia di impianto
- **Citta'** — filtra per citta'
- **Stato** — filtra per stato operativo
- **Tags** — filtra per etichette personalizzate

#### Scheda Impianto (Form)

Cliccando su "Nuovo Impianto" o sul pulsante modifica, si accede alla scheda dettaglio con:

**Dati principali:**
- Codice, Nome, Tipo, Formato
- Indirizzo, Citta', Provincia, CAP
- Latitudine e Longitudine
- Concessionario (societa' proprietaria)
- Illuminato (si/no), Digitale (si/no)
- Numero di facce
- Stato operativo
- Note aggiuntive

**Fotografie:**
La scheda permette di caricare fino a 4 fotografie per ogni impianto:
- Foto Giorno
- Foto Notte
- Foto Frontale
- Foto Contesto

**Tags (Etichette):**
E' possibile assegnare etichette personalizzate a ogni impianto per facilitare la categorizzazione e la ricerca.

---

## 5. Come si utilizza — Guida rapida

### Creare un nuovo impianto

1. Dalla sidebar, cliccare su **Gestione Impianti**
2. Cliccare il pulsante **Nuovo Impianto**
3. Compilare i campi del form (i campi obbligatori sono: Codice, Nome, Tipo, Citta')
4. Se disponibili, caricare le foto cliccando sulle aree dedicate
5. Selezionare i tags desiderati
6. Cliccare **Salva**

### Modificare un impianto

1. Nella lista impianti, trovare l'impianto desiderato
2. Cliccare sull'icona di modifica (matita) nella colonna Azioni
3. Modificare i campi necessari
4. Cliccare **Salva**

### Eliminare un impianto

1. Nella lista impianti, cliccare sull'icona di eliminazione (cestino)
2. Confermare l'eliminazione nella finestra di dialogo

### Filtrare gli impianti

1. Utilizzare i campi filtro sopra la tabella
2. Scrivere un testo di ricerca o selezionare un valore dai menu a tendina
3. I risultati si aggiornano automaticamente

---

## 6. Architettura tecnica

### Stack tecnologico

| Componente | Tecnologia |
|------------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (vanilla), Bootstrap 5 |
| **Backend** | Python 3.11, FastAPI |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy 2.0 |
| **Migrazioni** | Alembic |
| **Hosting** | Render.com (Frankfurt, EU) |

### Struttura del progetto

```
cartesia/
├── frontend/                    # Interfaccia utente
│   ├── index.html               # Pagina principale (SPA)
│   ├── app.js                   # Logica applicativa JavaScript
│   ├── styles.css               # Stili personalizzati
│   ├── version.json             # Versione della piattaforma
│   └── assets/                  # Loghi e risorse grafiche
│
├── backend/                     # Server API
│   ├── app/
│   │   ├── main.py              # Entry point FastAPI
│   │   ├── database.py          # Connessione database
│   │   ├── models/              # Modelli dati (SQLAlchemy + Pydantic)
│   │   │   ├── user_sql.py      # Modello utenti
│   │   │   ├── cliente_sql.py   # Modello clienti
│   │   │   ├── impianto_sql.py  # Modello impianti
│   │   │   └── tag_sql.py       # Modello tags
│   │   ├── routers/             # Endpoint API
│   │   │   ├── impianto.py      # API impianti e tags
│   │   │   └── ...
│   │   └── core/                # Sicurezza e utilita'
│   │       └── security.py      # Hashing password
│   └── alembic/                 # Migrazioni database
│
├── render.yaml                  # Configurazione deploy Render.com
└── requirements.txt             # Dipendenze Python
```

### API disponibili

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login utente |
| GET | `/api/clienti/` | Lista clienti |
| POST | `/api/clienti/` | Crea cliente |
| PUT | `/api/clienti/{id}` | Modifica cliente |
| DELETE | `/api/clienti/{id}` | Elimina cliente |
| GET | `/api/impianti/` | Lista impianti (con filtri) |
| GET | `/api/impianti/{id}` | Dettaglio impianto |
| POST | `/api/impianti/` | Crea impianto |
| PUT | `/api/impianti/{id}` | Modifica impianto |
| DELETE | `/api/impianti/{id}` | Elimina impianto |
| POST | `/api/impianti/upload-foto` | Carica foto impianto |
| GET | `/api/tags/` | Lista tags |
| POST | `/api/tags/` | Crea tag |
| DELETE | `/api/tags/{id}` | Elimina tag |
| GET | `/health` | Health check |

---

## 7. Sviluppi futuri previsti

| Fase | Funzionalita' | Stato |
|------|---------------|-------|
| Fase 1 | Gestione Impianti + Tags + Ricerca | **Completata** |
| Fase 2 | Listino Prezzi per impianto | Pianificata |
| Fase 3 | Campagne Pubblicitarie | Pianificata |
| Fase 4 | Ordini + Dashboard KPI | Pianificata |
| Fase 5 | Geo-segmentazione + Mappe interattive | Pianificata |
| — | Fatturazione | Pianificata |
| — | Calcolo automatico coordinate da indirizzo | Pianificata |
| — | Visualizzazione impianti su mappa | Pianificata |

---

## 8. Ambiente di sviluppo locale

### Prerequisiti

- Python 3.11 o 3.12
- PostgreSQL installato e attivo
- Pipenv (`pip install pipenv`)

### Servizi da avviare in locale

Per far funzionare la piattaforma in locale sono necessari **2 servizi**:

| # | Servizio | Porta | Stato richiesto |
|---|----------|-------|-----------------|
| 1 | **PostgreSQL** | 5432 | Deve essere attivo prima di tutto |
| 2 | **Backend FastAPI (Uvicorn)** | 8002 | Si avvia manualmente |

> **Nota:** Il frontend non richiede un server separato — viene servito direttamente dal backend FastAPI.

### Passo 1 — Avviare PostgreSQL

```bash
# Verificare se PostgreSQL e' attivo
brew services list | grep postgresql

# Se non e' attivo, avviarlo
brew services start postgresql@14
```

### Passo 2 — Verificare il database

| Parametro | Valore |
|-----------|--------|
| **Database** | `jb_consulenti_db` |
| **Utente** | `jb_user` |
| **Password** | `password_sicura` |
| **Host** | `localhost` |
| **Porta** | `5432` |

```bash
# Verificare che il database esista
psql -U jb_user -d jb_consulenti_db -c "SELECT 1;"
```

### Passo 3 — Avviare il Backend

```bash
cd ~/jb-consulenti/backend
/Users/marcos.orchetti/.local/share/virtualenvs/backend-HbhTxEWn/bin/uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
```

Se il server parte correttamente, vedrai nel terminale:
```
INFO:     Uvicorn running on http://127.0.0.1:8002 (Press CTRL+C to quit)
INFO:     Started reloader process [...] using StatReload
```

### Procedura completa di avvio (copia-incolla)

```bash
# 1. Avvia PostgreSQL (se non gia' attivo)
brew services start postgresql@14

# 2. Avvia il backend
cd ~/jb-consulenti/backend
/Users/marcos.orchetti/.local/share/virtualenvs/backend-HbhTxEWn/bin/uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
```

### Spegnimento

```bash
# Fermare il backend: premi CTRL+C nel terminale dove e' in esecuzione

# Fermare PostgreSQL (opzionale)
brew services stop postgresql@14
```

### Accesso locale

| Parametro | Valore |
|-----------|--------|
| **URL** | `http://127.0.0.1:8002` |
| **Username** | `admin` |
| **Password** | `Admin123!` |

### Comandi utili

```bash
# Eseguire migrazioni database
cd ~/jb-consulenti/backend
alembic upgrade head

# Creare utente admin
python create_admin.py
```

### Percorsi principali

| Cosa | Percorso |
|------|----------|
| Progetto | `~/jb-consulenti/` |
| Backend | `~/jb-consulenti/backend/` |
| Frontend | `~/jb-consulenti/frontend/` |
| Virtualenv | `~/.local/share/virtualenvs/backend-HbhTxEWn/` |
| Uploads foto | `~/jb-consulenti/uploads/` |
| Repo GitHub | `github.com/MarcoSorchetti/cartesia` |

---

## 9. Contatti e supporto

**Sviluppo:** Gia.Mar Srl
**Responsabile Progetto:** Marco Sorchetti
**Piattaforma:** Cartesia v1.0.1
