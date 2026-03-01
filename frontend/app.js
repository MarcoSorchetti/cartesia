// =====================================================================
// CONFIGURAZIONE BASE
// =====================================================================

const API_URL = "/api";  // Prefisso API — funziona sia in locale che su Render

// =====================================================================
// AUTENTICAZIONE: CONTROLLO TOKEN
// =====================================================================

function getToken() {
  return localStorage.getItem("jb_token");
}

function getCurrentUserName() {
  return localStorage.getItem("jb_user") || "admin";
}

(function guardiaLogin() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
})();

// =====================================================================
// LOGOUT
// =====================================================================

function effettuaLogout() {
  localStorage.removeItem("jb_token");
  localStorage.removeItem("jb_token_type");
  localStorage.removeItem("jb_user");
  localStorage.removeItem("jb_is_admin");
  window.location.href = "login.html";
}

// =====================================================================
// TOAST NOTIFICHE
// =====================================================================

const TOAST_ICONS = {
  success: "fa-solid fa-circle-check",
  error: "fa-solid fa-circle-xmark",
  warning: "fa-solid fa-triangle-exclamation",
};

function showToast(messaggio, tipo = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${tipo}`;
  toast.innerHTML = `<i class="${TOAST_ICONS[tipo] || TOAST_ICONS.success}"></i><span>${messaggio}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

// =====================================================================
// MODAL CONFERMA (sostituzione confirm())
// =====================================================================

function showConfirm(messaggio) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-overlay");
    const msgEl = document.getElementById("confirm-message");
    const btnOk = document.getElementById("confirm-ok");
    const btnCancel = document.getElementById("confirm-cancel");

    if (!overlay) { resolve(false); return; }

    msgEl.textContent = messaggio;
    overlay.style.display = "flex";

    function cleanup() {
      overlay.style.display = "none";
      btnOk.onclick = null;
      btnCancel.onclick = null;
    }

    btnOk.onclick = () => { cleanup(); resolve(true); };
    btnCancel.onclick = () => { cleanup(); resolve(false); };
  });
}

// =====================================================================
// SIDEBAR MOBILE
// =====================================================================

function initSidebarMobile() {
  const hamburger = document.getElementById("hamburger-btn");
  const sidebar = document.getElementById("app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (!hamburger || !sidebar) return;

  hamburger.onclick = () => {
    sidebar.classList.toggle("sidebar-open");
    overlay.classList.toggle("show");
  };

  if (overlay) {
    overlay.onclick = () => {
      sidebar.classList.remove("sidebar-open");
      overlay.classList.remove("show");
    };
  }
}

function closeSidebarMobile() {
  const sidebar = document.getElementById("app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar) sidebar.classList.remove("sidebar-open");
  if (overlay) overlay.classList.remove("show");
}

// =====================================================================
// STATO APPLICAZIONE
// =====================================================================

let clientiLista = [];
let filtroCorrente = "";
let clienteInModifica = null;

let utentiLista = [];
let filtroUtenti = "";
let utenteInModifica = null;

// =====================================================================
// VERSIONING
// =====================================================================

async function getAppVersion() {
  try {
    const res = await fetch("version.json", { cache: "no-store" });
    if (!res.ok) return "0.0.0";
    const data = await res.json();
    return data.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

// =====================================================================
// NAVIGAZIONE
// =====================================================================

function setActiveMenu(id) {
  document
    .querySelectorAll(".sidebar-link")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

// =====================================================================
// HOME PAGE MIGLIORATA
// =====================================================================

async function renderHome() {
  const main = document.getElementById("main-content");
  const version = await getAppVersion();
  const userName = getCurrentUserName();

  main.innerHTML = `
    <div class="d-flex flex-column align-items-center justify-content-center home-welcome"
         style="min-height: 60vh;">
      <img src="assets/Logo-Azienda.png" style="height:100px;" class="mb-4" />
      <h1 class="home-greeting mb-2">Benvenuto, <span>${userName}</span></h1>
      <p class="home-subtitle mb-4">Piattaforma gestionale integrata &middot; Ver. ${version}</p>

      <div class="row g-3 w-100" style="max-width:500px;">
        <div class="col-6">
          <div class="quick-card" id="quick-clienti">
            <div class="quick-card-icon"><i class="fa-solid fa-users"></i></div>
            <div class="quick-card-title">Clienti</div>
            <div class="quick-card-desc">Gestione anagrafica</div>
          </div>
        </div>
        <div class="col-6">
          <div class="quick-card" id="quick-utenti">
            <div class="quick-card-icon"><i class="fa-solid fa-user-gear"></i></div>
            <div class="quick-card-title">Utenti</div>
            <div class="quick-card-desc">Accessi e ruoli</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("quick-clienti")?.addEventListener("click", () => {
    setActiveMenu("menu-clienti");
    renderClienti();
    closeSidebarMobile();
  });

  document.getElementById("quick-utenti")?.addEventListener("click", () => {
    setActiveMenu("menu-utenti");
    renderUtenti();
    closeSidebarMobile();
  });
}

// =====================================================================
// RENDER CLIENTI / UTENTI
// =====================================================================

function renderClienti() {
  const main = document.getElementById("main-content");
  const tpl = document.getElementById("template-clienti");
  main.innerHTML = "";
  main.appendChild(tpl.content.cloneNode(true));
  initClientiUI();
  caricaClienti();
}

function renderUtenti() {
  const main = document.getElementById("main-content");
  const tpl = document.getElementById("template-utenti");
  main.innerHTML = "";
  main.appendChild(tpl.content.cloneNode(true));
  initUtentiUI();
  caricaUtenti();
}

// =====================================================================
// INIZIALIZZAZIONE PAGINA
// =====================================================================

document.addEventListener("DOMContentLoaded", async () => {
  initSidebarMobile();

  document.getElementById("menu-home").onclick = async () => {
    setActiveMenu("menu-home");
    await renderHome();
    closeSidebarMobile();
  };

  document.getElementById("menu-clienti").onclick = () => {
    setActiveMenu("menu-clienti");
    renderClienti();
    closeSidebarMobile();
  };

  const menuUtenti = document.getElementById("menu-utenti");
  if (menuUtenti) {
    menuUtenti.onclick = () => {
      setActiveMenu("menu-utenti");
      renderUtenti();
      closeSidebarMobile();
    };
  }

  const logoutBtn = document.getElementById("menu-logout");
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      const ok = await showConfirm("Vuoi davvero uscire?");
      if (ok) effettuaLogout();
    };
  }

  const userSpan = document.getElementById("current-username");
  if (userSpan) {
    userSpan.textContent = getCurrentUserName();
  }

  await renderHome();
});

// =====================================================================
// UI CLIENTI
// =====================================================================

function initClientiUI() {
  document.getElementById("cliente-form").onsubmit = salvaCliente;

  document.getElementById("filtro-clienti").oninput = (e) => {
    filtroCorrente = e.target.value.toLowerCase();
    renderTabellaClienti();
  };

  document.getElementById("btn-nuovo-cliente").onclick = () => resetForm();

  const annullaBtn = document.getElementById("annulla-btn-cliente");
  if (annullaBtn) annullaBtn.onclick = () => resetForm();

  document.getElementById("clienti-tbody").onclick = async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains("js-edit")) modificaCliente(id);
    if (btn.classList.contains("js-delete")) {
      const ok = await showConfirm("Vuoi davvero eliminare questo cliente?");
      if (ok) eliminaCliente(id);
    }
  };
}

// =====================================================================
// UI UTENTI
// =====================================================================

function initUtentiUI() {
  const form = document.getElementById("utente-form");
  if (form) form.onsubmit = salvaUtente;

  const filtro = document.getElementById("filtro-utenti");
  if (filtro) {
    filtro.oninput = (e) => {
      filtroUtenti = e.target.value.toLowerCase();
      renderTabellaUtenti();
    };
  }

  const btnNuovo = document.getElementById("btn-nuovo-utente");
  if (btnNuovo) btnNuovo.onclick = () => resetFormUtente();

  const annullaBtn = document.getElementById("annulla-btn-utente");
  if (annullaBtn) annullaBtn.onclick = () => resetFormUtente();

  const tbody = document.getElementById("utenti-tbody");
  if (tbody) {
    tbody.onclick = async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains("js-edit-utente")) modificaUtente(id);
      if (btn.classList.contains("js-delete-utente")) {
        const ok = await showConfirm("Vuoi davvero eliminare questo utente?");
        if (ok) eliminaUtente(id);
      }
    };
  }
}

// =====================================================================
// API CLIENTI
// =====================================================================

async function caricaClienti() {
  try {
    const res = await fetch(`${API_URL}/clienti/`);
    if (!res.ok) {
      showToast("Errore nel caricamento clienti", "error");
      return;
    }
    clientiLista = await res.json();
    renderTabellaClienti();
  } catch (err) {
    console.error("Errore fetch /clienti:", err);
    showToast("Impossibile contattare il server", "error");
  }
}

async function salvaCliente(event) {
  event.preventDefault();

  const payload = {
    azienda: document.getElementById("azienda").value,
    partita_iva: document.getElementById("partitaIva").value,
    email: document.getElementById("email").value,
    indirizzo: document.getElementById("indirizzo").value,
    cap: document.getElementById("cap").value,
    citta: document.getElementById("citta").value,
    codice_univoco: document.getElementById("codiceUnivoco").value,
    telefono: document.getElementById("telefono").value,
  };

  try {
    let url = `${API_URL}/clienti/`;
    let method = "POST";

    if (clienteInModifica) {
      url = `${API_URL}/clienti/${clienteInModifica}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      showToast("Errore nel salvataggio cliente", "error");
      return;
    }

    showToast(
      clienteInModifica ? "Cliente aggiornato con successo" : "Cliente creato con successo",
      "success"
    );
    resetForm();
    await caricaClienti();
  } catch (err) {
    console.error("Errore salvaCliente:", err);
    showToast("Errore di comunicazione con il server", "error");
  }
}

async function eliminaCliente(id) {
  try {
    const res = await fetch(`${API_URL}/clienti/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Errore nell'eliminazione cliente", "error");
      return;
    }
    showToast("Cliente eliminato", "success");
    await caricaClienti();
  } catch (err) {
    console.error("Errore eliminaCliente:", err);
    showToast("Errore di comunicazione con il server", "error");
  }
}

// =====================================================================
// API UTENTI
// =====================================================================

async function caricaUtenti() {
  try {
    const res = await fetch(`${API_URL}/users/`);
    if (!res.ok) {
      showToast("Errore nel caricamento utenti", "error");
      utentiLista = [];
      renderTabellaUtenti();
      return;
    }
    utentiLista = await res.json();
    renderTabellaUtenti();
  } catch (err) {
    console.error("Errore fetch /users:", err);
    showToast("Impossibile contattare il server", "error");
    utentiLista = [];
    renderTabellaUtenti();
  }
}

async function salvaUtente(event) {
  event.preventDefault();

  const username = document.getElementById("utente-username").value;
  const password = document.getElementById("utente-password").value;
  const isActive = document.getElementById("utente-is-active").checked;

  const payload = { username, password, is_active: isActive };

  try {
    let url = `${API_URL}/users/`;
    let method = "POST";

    if (utenteInModifica) {
      url = `${API_URL}/users/${utenteInModifica}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      showToast("Errore nel salvataggio utente", "error");
      return;
    }

    showToast(
      utenteInModifica ? "Utente aggiornato con successo" : "Utente creato con successo",
      "success"
    );
    resetFormUtente();
    await caricaUtenti();
  } catch (err) {
    console.error("Errore salvaUtente:", err);
    showToast("Errore di comunicazione con il server", "error");
  }
}

async function eliminaUtente(id) {
  try {
    const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Errore nell'eliminazione utente", "error");
      return;
    }
    showToast("Utente eliminato", "success");
    await caricaUtenti();
  } catch (err) {
    console.error("Errore eliminaUtente:", err);
    showToast("Errore di comunicazione con il server", "error");
  }
}

// =====================================================================
// MODIFICA / RESET CLIENTI
// =====================================================================

function modificaCliente(id) {
  const cliente = clientiLista.find((c) => String(c.id) === String(id));
  if (!cliente) return;

  document.getElementById("azienda").value = cliente.azienda ?? "";
  document.getElementById("partitaIva").value = cliente.partita_iva ?? "";
  document.getElementById("email").value = cliente.email ?? "";
  document.getElementById("indirizzo").value = cliente.indirizzo ?? "";
  document.getElementById("cap").value = cliente.cap ?? "";
  document.getElementById("citta").value = cliente.citta ?? "";
  document.getElementById("codiceUnivoco").value = cliente.codice_univoco ?? "";
  document.getElementById("telefono").value = cliente.telefono ?? "";

  clienteInModifica = cliente.id;

  const titolo = document.getElementById("form-titolo");
  if (titolo) titolo.innerText = "Modifica Cliente";

  const annullaBtn = document.getElementById("annulla-btn-cliente");
  if (annullaBtn) annullaBtn.style.display = "inline-flex";

  // Evidenzia riga in tabella
  document.querySelectorAll("#clienti-tbody tr").forEach((tr) => tr.classList.remove("row-editing"));
  document.querySelectorAll("#clienti-tbody tr").forEach((tr) => {
    const firstTd = tr.querySelector("td");
    if (firstTd && firstTd.textContent.trim() === String(id)) {
      tr.classList.add("row-editing");
    }
  });
}

function resetForm() {
  document.getElementById("cliente-form").reset();
  clienteInModifica = null;

  const titolo = document.getElementById("form-titolo");
  if (titolo) titolo.innerText = "Nuovo Cliente";

  const annullaBtn = document.getElementById("annulla-btn-cliente");
  if (annullaBtn) annullaBtn.style.display = "none";

  document.querySelectorAll("#clienti-tbody tr").forEach((tr) => tr.classList.remove("row-editing"));
  document.querySelectorAll("#cliente-form .form-control").forEach((el) => {
    el.classList.remove("is-valid-custom", "is-invalid-custom");
  });
}

// =====================================================================
// MODIFICA / RESET UTENTI
// =====================================================================

function modificaUtente(id) {
  const utente = utentiLista.find((u) => String(u.id) === String(id));
  if (!utente) return;

  document.getElementById("utente-username").value = utente.username ?? "";
  document.getElementById("utente-password").value = "";
  document.getElementById("utente-is-admin").checked = !!utente.is_admin;
  document.getElementById("utente-is-active").checked = !!utente.is_active;

  utenteInModifica = utente.id;

  const titolo = document.getElementById("form-utente-titolo");
  if (titolo) titolo.innerText = "Modifica Utente";

  const annullaBtn = document.getElementById("annulla-btn-utente");
  if (annullaBtn) annullaBtn.style.display = "inline-flex";

  document.querySelectorAll("#utenti-tbody tr").forEach((tr) => tr.classList.remove("row-editing"));
  document.querySelectorAll("#utenti-tbody tr").forEach((tr) => {
    const firstTd = tr.querySelector("td");
    if (firstTd && firstTd.textContent.trim() === String(id)) {
      tr.classList.add("row-editing");
    }
  });
}

function resetFormUtente() {
  const form = document.getElementById("utente-form");
  if (form) form.reset();
  utenteInModifica = null;

  const titolo = document.getElementById("form-utente-titolo");
  if (titolo) titolo.innerText = "Nuovo Utente";

  const annullaBtn = document.getElementById("annulla-btn-utente");
  if (annullaBtn) annullaBtn.style.display = "none";

  document.querySelectorAll("#utenti-tbody tr").forEach((tr) => tr.classList.remove("row-editing"));
}

// =====================================================================
// RENDER TABELLA CLIENTI
// =====================================================================

function renderTabellaClienti() {
  const tbody = document.getElementById("clienti-tbody");
  if (!tbody) return;

  let list = clientiLista;
  if (filtroCorrente && filtroCorrente.trim() !== "") {
    list = clientiLista.filter((c) =>
      Object.values(c || {}).join(" ").toLowerCase().includes(filtroCorrente)
    );
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-secondary">Nessun cliente trovato</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map(
      (c, i) => `
    <tr style="animation-delay: ${i * 0.03}s"
        class="${clienteInModifica && clienteInModifica === c.id ? 'row-editing' : ''}">
      <td>${c.id ?? ""}</td>
      <td>${c.azienda ?? ""}</td>
      <td>${c.partita_iva ?? ""}</td>
      <td>${c.email ?? ""}</td>
      <td>${c.citta ?? ""}</td>
      <td>${c.codice_univoco ?? ""}</td>
      <td>${c.telefono ?? ""}</td>
      <td class="text-center">
        <button class="btn-action btn-action-edit js-edit" data-id="${c.id}" title="Modifica">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn-action btn-action-delete js-delete" data-id="${c.id}" title="Elimina">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>`
    )
    .join("");
}

// =====================================================================
// RENDER TABELLA UTENTI
// =====================================================================

function renderTabellaUtenti() {
  const tbody = document.getElementById("utenti-tbody");
  if (!tbody) return;

  let list = utentiLista;
  if (filtroUtenti && filtroUtenti.trim() !== "") {
    list = utentiLista.filter((u) =>
      Object.values(u || {}).join(" ").toLowerCase().includes(filtroUtenti)
    );
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Nessun utente trovato</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map(
      (u, i) => `
    <tr style="animation-delay: ${i * 0.03}s"
        class="${utenteInModifica && utenteInModifica === u.id ? 'row-editing' : ''}">
      <td>${u.id ?? ""}</td>
      <td>${u.username ?? ""}</td>
      <td>
        <span class="badge-status ${u.is_admin ? 'badge-admin' : 'badge-user'}">
          <i class="fa-solid ${u.is_admin ? 'fa-shield-halved' : 'fa-user'}"></i>
          ${u.is_admin ? "Admin" : "Utente"}
        </span>
      </td>
      <td>
        <span class="badge-status ${u.is_active ? 'badge-active' : 'badge-inactive'}">
          <i class="fa-solid ${u.is_active ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
          ${u.is_active ? "Attivo" : "Disattivo"}
        </span>
      </td>
      <td class="text-center">
        <button class="btn-action btn-action-edit js-edit-utente" data-id="${u.id}" title="Modifica">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn-action btn-action-delete js-delete-utente" data-id="${u.id}" title="Elimina">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>`
    )
    .join("");
}
