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

let impiantiLista = [];
let tagLista = [];
let filtroImpianti = "";
let impiantoInModifica = null;
let tagFiltroAttivo = null;
let fotoImpianto = { foto_giorno: null, foto_notte: null, foto_frontale: null, foto_contesto: null };

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
      <h1 class="home-greeting mb-2">Cartesia</h1>
      <p class="home-subtitle mb-3">Gestione Cartelli Fisici e Digitali</p>
      <img src="assets/Logo-Azienda.png" class="home-logo mb-3" />
      <p class="home-greeting-user mb-4">Benvenuto, <span>${userName}</span> &middot; Ver. ${version}</p>

      <div class="row g-3 w-100" style="max-width:700px;">
        <div class="col-4">
          <div class="quick-card" id="quick-clienti">
            <div class="quick-card-icon"><i class="fa-solid fa-users"></i></div>
            <div class="quick-card-title">Clienti</div>
            <div class="quick-card-desc">Gestione anagrafica</div>
          </div>
        </div>
        <div class="col-4">
          <div class="quick-card" id="quick-utenti">
            <div class="quick-card-icon"><i class="fa-solid fa-user-gear"></i></div>
            <div class="quick-card-title">Utenti</div>
            <div class="quick-card-desc">Accessi e ruoli</div>
          </div>
        </div>
        <div class="col-4">
          <div class="quick-card" id="quick-impianti">
            <div class="quick-card-icon"><i class="fa-solid fa-sign-hanging"></i></div>
            <div class="quick-card-title">Gestione Impianti</div>
            <div class="quick-card-desc">Gestione Impianti</div>
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

  document.getElementById("quick-impianti")?.addEventListener("click", () => {
    setActiveMenu("menu-impianti");
    renderImpianti();
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

function renderImpianti() {
  const main = document.getElementById("main-content");
  const tpl = document.getElementById("template-impianti");
  main.innerHTML = "";
  main.appendChild(tpl.content.cloneNode(true));
  impiantoInModifica = null;
  initImpiantiListUI();
  caricaImpianti();
  caricaTags();
}

function renderImpiantoForm(id) {
  const main = document.getElementById("main-content");
  const tpl = document.getElementById("template-impianto-form");
  main.innerHTML = "";
  main.appendChild(tpl.content.cloneNode(true));

  // Reset foto state
  fotoImpianto = { foto_giorno: null, foto_notte: null, foto_frontale: null, foto_contesto: null };

  if (id) {
    impiantoInModifica = id;
    const titolo = document.getElementById("form-impianto-titolo");
    if (titolo) titolo.innerText = "Modifica Impianto";
  } else {
    impiantoInModifica = null;
  }

  initImpiantoFormUI();
  caricaTagsPerForm().then(() => {
    if (id) popolaFormImpianto(id);
  });
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

  const menuImpianti = document.getElementById("menu-impianti");
  if (menuImpianti) {
    menuImpianti.onclick = () => {
      setActiveMenu("menu-impianti");
      renderImpianti();
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
// UI IMPIANTI — LISTA
// =====================================================================

function initImpiantiListUI() {
  const filtro = document.getElementById("filtro-impianti");
  if (filtro) {
    filtro.oninput = (e) => {
      filtroImpianti = e.target.value.toLowerCase();
      renderTabellaImpianti();
    };
  }

  const btnNuovo = document.getElementById("btn-nuovo-impianto");
  if (btnNuovo) btnNuovo.onclick = () => renderImpiantoForm();

  const btnFiltra = document.getElementById("btn-applica-filtri");
  if (btnFiltra) btnFiltra.onclick = () => caricaImpianti();

  const tbody = document.getElementById("impianti-tbody");
  if (tbody) {
    tbody.onclick = async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains("js-edit-imp")) renderImpiantoForm(parseInt(id));
      if (btn.classList.contains("js-delete-imp")) {
        const ok = await showConfirm("Vuoi davvero eliminare questo impianto?");
        if (ok) eliminaImpianto(id);
      }
    };
  }
}

// =====================================================================
// UI IMPIANTI — FORM
// =====================================================================

function initImpiantoFormUI() {
  const form = document.getElementById("impianto-form");
  if (form) form.onsubmit = salvaImpianto;

  const btnTorna = document.getElementById("btn-torna-elenco");
  if (btnTorna) btnTorna.onclick = () => renderImpianti();

  const annullaBtn = document.getElementById("annulla-btn-impianto");
  if (annullaBtn) annullaBtn.onclick = () => renderImpianti();

  // Foto upload handlers
  const fotoTypes = ["giorno", "notte", "frontale", "contesto"];
  fotoTypes.forEach((tipo) => {
    const preview = document.getElementById(`foto-${tipo}-preview`);
    const input = document.getElementById(`foto-${tipo}-input`);
    if (preview && input) {
      preview.onclick = () => input.click();
      input.onchange = () => uploadFoto(tipo);
    }
  });
}

// =====================================================================
// FOTO UPLOAD
// =====================================================================

async function uploadFoto(tipo) {
  const input = document.getElementById(`foto-${tipo}-input`);
  const preview = document.getElementById(`foto-${tipo}-preview`);
  if (!input || !input.files.length) return;

  const file = input.files[0];
  const formData = new FormData();
  formData.append("file", file);

  preview.innerHTML = '<i class="fa-solid fa-spinner fa-spin fa-2x text-secondary"></i><span class="small text-secondary mt-1">Caricamento...</span>';

  try {
    const res = await fetch(`${API_URL}/impianti/upload-foto`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.detail || "Errore nel caricamento foto", "error");
      resetFotoPreview(tipo);
      return;
    }

    const data = await res.json();
    const key = tipo === "giorno" ? "foto_giorno" : tipo === "notte" ? "foto_notte" : tipo === "frontale" ? "foto_frontale" : "foto_contesto";
    fotoImpianto[key] = data.url;

    // Mostra anteprima
    const ext = (file.name || "").split(".").pop().toLowerCase();
    if (ext === "pdf") {
      preview.innerHTML = `<i class="fa-solid fa-file-pdf fa-2x" style="color:#ef4444;"></i>
        <span class="small text-secondary mt-1">${file.name}</span>
        <button type="button" class="btn-remove-foto" title="Rimuovi"><i class="fa-solid fa-xmark"></i></button>`;
    } else {
      preview.innerHTML = `<img src="${data.url}" alt="Foto ${tipo}" />
        <button type="button" class="btn-remove-foto" title="Rimuovi"><i class="fa-solid fa-xmark"></i></button>`;
    }

    // Bottone rimuovi
    preview.querySelector(".btn-remove-foto").onclick = (e) => {
      e.stopPropagation();
      fotoImpianto[key] = null;
      resetFotoPreview(tipo);
    };

    showToast("Foto caricata con successo", "success");
  } catch (err) {
    console.error("Errore upload foto:", err);
    showToast("Errore di comunicazione con il server", "error");
    resetFotoPreview(tipo);
  }
}

function resetFotoPreview(tipo) {
  const preview = document.getElementById(`foto-${tipo}-preview`);
  const icons = { giorno: "fa-sun", notte: "fa-moon", frontale: "fa-image", contesto: "fa-city" };
  if (preview) {
    preview.innerHTML = `<i class="fa-solid ${icons[tipo]} fa-2x text-secondary"></i>
      <span class="small text-secondary mt-1">Clicca per caricare</span>`;
  }
}

function mostraFotoPreview(tipo, url) {
  const preview = document.getElementById(`foto-${tipo}-preview`);
  if (!preview || !url) return;

  const ext = url.split(".").pop().toLowerCase();
  if (ext === "pdf") {
    preview.innerHTML = `<i class="fa-solid fa-file-pdf fa-2x" style="color:#ef4444;"></i>
      <span class="small text-secondary mt-1">PDF caricato</span>
      <button type="button" class="btn-remove-foto" title="Rimuovi"><i class="fa-solid fa-xmark"></i></button>`;
  } else {
    preview.innerHTML = `<img src="${url}" alt="Foto ${tipo}" />
      <button type="button" class="btn-remove-foto" title="Rimuovi"><i class="fa-solid fa-xmark"></i></button>`;
  }

  const key = tipo === "giorno" ? "foto_giorno" : tipo === "notte" ? "foto_notte" : tipo === "frontale" ? "foto_frontale" : "foto_contesto";
  preview.querySelector(".btn-remove-foto").onclick = (e) => {
    e.stopPropagation();
    fotoImpianto[key] = null;
    resetFotoPreview(tipo);
  };
}

// =====================================================================
// API IMPIANTI
// =====================================================================

async function caricaImpianti() {
  try {
    // Costruisci query string dai filtri
    const params = new URLSearchParams();
    const qFiltro = document.getElementById("filtro-impianti")?.value?.trim();
    const tipoFiltro = document.getElementById("filtro-tipo")?.value;
    const cittaFiltro = document.getElementById("filtro-citta-imp")?.value?.trim();
    const statoFiltro = document.getElementById("filtro-stato-imp")?.value;

    if (qFiltro) params.set("q", qFiltro);
    if (tipoFiltro) params.set("tipo", tipoFiltro);
    if (cittaFiltro) params.set("citta", cittaFiltro);
    if (statoFiltro) params.set("stato", statoFiltro);
    if (tagFiltroAttivo) params.set("tag", tagFiltroAttivo);

    const qs = params.toString();
    const url = `${API_URL}/impianti/${qs ? "?" + qs : ""}`;

    const res = await fetch(url);
    if (!res.ok) {
      showToast("Errore nel caricamento impianti", "error");
      return;
    }
    impiantiLista = await res.json();
    renderTabellaImpianti();
  } catch (err) {
    console.error("Errore fetch /impianti:", err);
    showToast("Impossibile contattare il server", "error");
  }
}

async function caricaTags() {
  try {
    const res = await fetch(`${API_URL}/tags/`);
    if (!res.ok) return;
    tagLista = await res.json();
    renderTagFilterBar();
  } catch (err) {
    console.error("Errore fetch /tags:", err);
  }
}

async function caricaTagsPerForm() {
  try {
    const res = await fetch(`${API_URL}/tags/`);
    if (!res.ok) return;
    tagLista = await res.json();
    renderTagCheckboxes();
  } catch (err) {
    console.error("Errore fetch /tags:", err);
  }
}

async function salvaImpianto(event) {
  event.preventDefault();

  // Raccogli tag selezionati
  const tagIds = [];
  document.querySelectorAll("#imp-tags-container .tag-checkbox:checked").forEach((cb) => {
    tagIds.push(parseInt(cb.value));
  });

  const payload = {
    codice: document.getElementById("imp-codice").value.trim(),
    nome: document.getElementById("imp-nome").value.trim(),
    tipo: document.getElementById("imp-tipo").value,
    formato: document.getElementById("imp-formato").value.trim() || null,
    indirizzo: document.getElementById("imp-indirizzo").value.trim() || null,
    citta: document.getElementById("imp-citta").value.trim(),
    provincia: document.getElementById("imp-provincia").value.trim() || null,
    cap: document.getElementById("imp-cap").value.trim() || null,
    latitudine: document.getElementById("imp-lat").value ? parseFloat(document.getElementById("imp-lat").value) : null,
    longitudine: document.getElementById("imp-lon").value ? parseFloat(document.getElementById("imp-lon").value) : null,
    concessionario: document.getElementById("imp-concessionario").value.trim() || null,
    illuminato: document.getElementById("imp-illuminato").checked,
    digitale: document.getElementById("imp-digitale").checked,
    facce: parseInt(document.getElementById("imp-facce").value) || 1,
    stato: document.getElementById("imp-stato").value,
    note: document.getElementById("imp-note").value.trim() || null,
    foto_giorno: fotoImpianto.foto_giorno || null,
    foto_notte: fotoImpianto.foto_notte || null,
    foto_frontale: fotoImpianto.foto_frontale || null,
    foto_contesto: fotoImpianto.foto_contesto || null,
    tag_ids: tagIds,
  };

  try {
    let url = `${API_URL}/impianti/`;
    let method = "POST";

    if (impiantoInModifica) {
      url = `${API_URL}/impianti/${impiantoInModifica}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      showToast(errData.detail || "Errore nel salvataggio impianto", "error");
      return;
    }

    showToast(
      impiantoInModifica ? "Impianto aggiornato con successo" : "Impianto creato con successo",
      "success"
    );
    renderImpianti();
  } catch (err) {
    console.error("Errore salvaImpianto:", err);
    showToast("Errore di comunicazione con il server", "error");
  }
}

async function eliminaImpianto(id) {
  try {
    const res = await fetch(`${API_URL}/impianti/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Errore nell'eliminazione impianto", "error");
      return;
    }
    showToast("Impianto eliminato", "success");
    await caricaImpianti();
  } catch (err) {
    console.error("Errore eliminaImpianto:", err);
    showToast("Errore di comunicazione con il server", "error");
  }
}

// =====================================================================
// POPOLA FORM IMPIANTO (per modifica)
// =====================================================================

function popolaFormImpianto(id) {
  const imp = impiantiLista.find((i) => String(i.id) === String(id));
  if (!imp) return;

  document.getElementById("imp-codice").value = imp.codice ?? "";
  document.getElementById("imp-nome").value = imp.nome ?? "";
  document.getElementById("imp-tipo").value = imp.tipo ?? "";
  document.getElementById("imp-formato").value = imp.formato ?? "";
  document.getElementById("imp-indirizzo").value = imp.indirizzo ?? "";
  document.getElementById("imp-citta").value = imp.citta ?? "";
  document.getElementById("imp-provincia").value = imp.provincia ?? "";
  document.getElementById("imp-cap").value = imp.cap ?? "";
  document.getElementById("imp-lat").value = imp.latitudine ?? "";
  document.getElementById("imp-lon").value = imp.longitudine ?? "";
  document.getElementById("imp-concessionario").value = imp.concessionario ?? "";
  document.getElementById("imp-illuminato").checked = !!imp.illuminato;
  document.getElementById("imp-digitale").checked = !!imp.digitale;
  document.getElementById("imp-facce").value = imp.facce ?? 1;
  document.getElementById("imp-stato").value = imp.stato ?? "attivo";
  document.getElementById("imp-note").value = imp.note ?? "";

  // Seleziona i tag dell'impianto
  const impTagIds = (imp.tags || []).map((t) => t.id);
  document.querySelectorAll("#imp-tags-container .tag-checkbox").forEach((cb) => {
    cb.checked = impTagIds.includes(parseInt(cb.value));
    const label = cb.closest(".badge-tag-check");
    if (label) label.classList.toggle("active", cb.checked);
  });

  // Carica anteprime foto esistenti
  fotoImpianto = {
    foto_giorno: imp.foto_giorno || null,
    foto_notte: imp.foto_notte || null,
    foto_frontale: imp.foto_frontale || null,
    foto_contesto: imp.foto_contesto || null,
  };

  if (imp.foto_giorno) mostraFotoPreview("giorno", imp.foto_giorno);
  if (imp.foto_notte) mostraFotoPreview("notte", imp.foto_notte);
  if (imp.foto_frontale) mostraFotoPreview("frontale", imp.foto_frontale);
  if (imp.foto_contesto) mostraFotoPreview("contesto", imp.foto_contesto);
}

// =====================================================================
// RENDER TABELLA IMPIANTI
// =====================================================================

const TIPO_LABELS = {
  billboard: "Billboard",
  poster: "Poster",
  digital_screen: "Digitale",
  pensilina: "Pensilina",
  arredo_urbano: "Arredo Urbano",
  altro: "Altro",
};

const TIPO_CLASSES = {
  billboard: "badge-tipo-billboard",
  poster: "badge-tipo-poster",
  digital_screen: "badge-tipo-digital",
  pensilina: "badge-tipo-pensilina",
  arredo_urbano: "badge-tipo-arredo",
  altro: "badge-tipo-altro",
};

const STATO_LABELS = {
  attivo: "Attivo",
  temp_offline: "Temp. Offline",
  dismesso: "Dismesso",
};

const STATO_CLASSES = {
  attivo: "badge-stato-attivo",
  temp_offline: "badge-stato-temp_offline",
  dismesso: "badge-stato-dismesso",
};

function renderTabellaImpianti() {
  const tbody = document.getElementById("impianti-tbody");
  if (!tbody) return;

  let list = impiantiLista;

  if (filtroImpianti && filtroImpianti.trim() !== "") {
    list = list.filter((imp) =>
      [imp.codice, imp.nome, imp.tipo, imp.citta, imp.indirizzo, imp.concessionario]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(filtroImpianti)
    );
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-secondary">Nessun impianto trovato</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map(
      (imp, i) => {
        const fotoCount = [imp.foto_giorno, imp.foto_notte, imp.foto_frontale, imp.foto_contesto].filter(Boolean).length;
        return `
    <tr style="animation-delay: ${i * 0.03}s">
      <td>${imp.codice ?? ""}</td>
      <td>${imp.nome ?? ""}</td>
      <td>
        <span class="badge-tipo ${TIPO_CLASSES[imp.tipo] || 'badge-tipo-altro'}">
          ${TIPO_LABELS[imp.tipo] || imp.tipo}
        </span>
      </td>
      <td>${imp.citta ?? ""}</td>
      <td>${imp.concessionario ?? ""}</td>
      <td>
        <span class="badge-stato ${STATO_CLASSES[imp.stato] || ''}">
          ${STATO_LABELS[imp.stato] || imp.stato}
        </span>
      </td>
      <td>
        ${(imp.tags || [])
          .map(
            (t) =>
              `<span class="badge-tag" style="border-color:${t.colore || '#2563eb'}; color:${t.colore || '#2563eb'}">${t.nome}</span>`
          )
          .join(" ")}
      </td>
      <td class="text-center">
        ${fotoCount > 0
          ? `<span class="badge-foto"><i class="fa-solid fa-camera"></i> ${fotoCount}</span>`
          : `<span class="text-secondary small">-</span>`}
      </td>
      <td class="text-center">
        <button class="btn-action btn-action-edit js-edit-imp" data-id="${imp.id}" title="Modifica">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn-action btn-action-delete js-delete-imp" data-id="${imp.id}" title="Elimina">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>`;
      }
    )
    .join("");
}

// =====================================================================
// TAG FILTER BAR + TAG CHECKBOXES
// =====================================================================

function renderTagFilterBar() {
  const bar = document.getElementById("tag-filter-bar");
  if (!bar) return;

  if (!tagLista.length) {
    bar.innerHTML = "";
    return;
  }

  bar.innerHTML = tagLista
    .map(
      (t) =>
        `<span class="badge-tag-filter ${tagFiltroAttivo === t.nome ? 'active' : ''}"
              style="border-color:${t.colore || '#2563eb'}; color:${t.colore || '#2563eb'}"
              data-tag="${t.nome}">${t.nome}</span>`
    )
    .join("");

  bar.onclick = (e) => {
    const badge = e.target.closest(".badge-tag-filter");
    if (!badge) return;
    const tagName = badge.dataset.tag;

    if (tagFiltroAttivo === tagName) {
      tagFiltroAttivo = null;
    } else {
      tagFiltroAttivo = tagName;
    }

    renderTagFilterBar();
    caricaImpianti();
  };
}

function renderTagCheckboxes() {
  const container = document.getElementById("imp-tags-container");
  if (!container) return;

  if (!tagLista.length) {
    container.innerHTML = '<span class="text-secondary small">Nessun tag disponibile</span>';
    return;
  }

  container.innerHTML = tagLista
    .map(
      (t) => `
      <label class="badge-tag-check" style="border-color:${t.colore || '#2563eb'}; color:${t.colore || '#2563eb'}">
        <input type="checkbox" class="tag-checkbox" value="${t.id}" style="display:none;" />
        ${t.nome}
      </label>`
    )
    .join("");

  // Toggle visual state on click
  container.querySelectorAll(".badge-tag-check").forEach((label) => {
    label.addEventListener("click", () => {
      const cb = label.querySelector(".tag-checkbox");
      // Il click sul label gia' togla il checkbox, quindi aggiorniamo solo lo stile
      setTimeout(() => {
        if (cb.checked) {
          label.classList.add("active");
        } else {
          label.classList.remove("active");
        }
      }, 0);
    });
  });
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
