// script.js — front-end : appelle l'API Flask et met a jour l'interface.
// Aucune logique d'attaque ici : tout se passe cote serveur (app.py /
// logic_bomb.py). Ce fichier ne fait qu'afficher l'etat renvoye.

const $ = (sel) => document.querySelector(sel);

// Correspondance statut -> classe de badge
const BADGE = {
  "Validee":   "ok",
  "Expediee":  "ok",
  "En cours":  "pending",
  "CORROMPUE": "corrupt",
};

async function appeler(path, methode = "POST") {
  const res = await fetch(path, { method: methode });
  if (!res.ok) throw new Error("Erreur reseau " + res.status);
  return res.json();
}

function rendreCommandes(etat) {
  const corps = $("#ordersBody");
  corps.innerHTML = "";
  for (const c of etat.commandes) {
    const corrompue = c.statut === "CORROMPUE";
    const tr = document.createElement("tr");
    if (corrompue) tr.className = "corrupt";
    const badge = BADGE[c.statut] || "info";
    const montant = corrompue ? "—" : c.montant + " €";
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.client}</td>
      <td>${c.produit}</td>
      <td>${montant}</td>
      <td><span class="badge ${badge}">${c.statut}</span></td>`;
    corps.appendChild(tr);
  }
  const n = etat.commandes.length;
  $("#counter").textContent =
    etat.nb_corrompues > 0
      ? `${etat.nb_corrompues}/${n} corrompues`
      : `${n} commandes saines`;
}

function rendreJournal(etat) {
  const log = $("#log");
  log.innerHTML = "";
  const etiquette = { info: "INFO", good: " OK ", warn: "WARN", bad: "!!!!" };
  for (const e of etat.journal) {
    const div = document.createElement("div");
    div.className = "log-line " + e.niveau;
    div.innerHTML =
      `<span class="t">[${e.heure}]</span>` +
      `<b>${etiquette[e.niveau] || "INFO"}</b>` +
      `<span class="msg">${e.message}</span>`;
    log.appendChild(div);
  }
  log.scrollTop = log.scrollHeight;
}

function rendreStatut(etat) {
  const box = $("#statusBox");
  box.classList.remove("is-bad", "is-warn");
  if (etat.systeme === "COMPROMIS") box.classList.add("is-bad");
  else if (etat.systeme === "EN ANALYSE") box.classList.add("is-warn");
  $("#statusValue").textContent = etat.systeme;

  // Bouton restaurer actif seulement si une attaque est en cours.
  $("#btnRestore").disabled = !etat.attaque_active;
}

function rendre(etat) {
  rendreCommandes(etat);
  rendreJournal(etat);
  rendreStatut(etat);
}

function brancher(id, path) {
  $(id).addEventListener("click", async () => {
    try {
      rendre(await appeler(path));
    } catch (e) {
      console.error(e);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  brancher("#btnTrigger", "/api/trigger");
  brancher("#btnAnalyze", "/api/analyze");
  brancher("#btnRestore", "/api/restore");
  brancher("#btnReset",   "/api/reset");

  // Etat initial
  try {
    rendre(await appeler("/api/etat", "GET"));
  } catch (e) {
    console.error("Impossible de charger l'etat initial", e);
  }
});
