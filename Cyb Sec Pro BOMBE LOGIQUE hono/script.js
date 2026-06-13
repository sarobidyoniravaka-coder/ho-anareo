// ----------------------------------------------------------------------
// Simulation pédagogique d'une bombe logique (aucune action réelle)
// ----------------------------------------------------------------------

const DATE_DEBUT = "2026-06-13";
const DATE_LIMITE = "2026-06-20";

const FICHIERS_INITIAUX = [
  { id: "f1", name: "base_donnees_clients.db", icon: "🗄️" },
  { id: "f2", name: "comptabilite_2026.xlsx", icon: "📊" },
  { id: "f3", name: "code_source_application.zip", icon: "📦" },
  { id: "f4", name: "configurations_reseau.conf", icon: "⚙️" },
  { id: "f5", name: "sauvegarde_paie.csv", icon: "💰" },
  { id: "f6", name: "certificats_ssl.pem", icon: "🔐" },
];

const $ = (selector) => document.querySelector(selector);

let state;

function resetState() {
  state = {
    currentDate: new Date(DATE_DEBUT),
    employeeFired: false,
    files: FICHIERS_INITIAUX.map((f) => ({ ...f, deleted: false })),
    backupSnapshot: null,
    attackHappened: false,
  };
}

function formatDate(date) {
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function log(message, type = "info") {
  const entry = document.createElement("div");
  entry.className = `log-entry log-${type}`;
  const time = new Date().toLocaleTimeString("fr-FR");
  entry.textContent = `[${time}] ${message}`;
  const logEl = $("#log");
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

function render() {
  $("#currentDate").textContent = formatDate(state.currentDate);

  const empBadge = $("#employeeStatus");
  if (state.employeeFired) {
    empBadge.textContent = "Licencié (compte toujours actif)";
    empBadge.className = "badge status-bad";
  } else {
    empBadge.textContent = "Actif";
    empBadge.className = "badge status-good";
  }

  const list = $("#fileList");
  list.innerHTML = "";
  state.files.forEach((f) => {
    const li = document.createElement("li");
    if (f.deleted) {
      li.className = "file-deleted";
      li.textContent = `${f.icon} ${f.name} — SUPPRIMÉ`;
    } else {
      li.textContent = `${f.icon} ${f.name}`;
    }
    list.appendChild(li);
  });
}

function advanceDate() {
  state.currentDate.setDate(state.currentDate.getDate() + 1);
  render();
  log(`📅 La date système est maintenant le ${formatDate(state.currentDate)}.`, "info");
}

function fireEmployee() {
  if (state.employeeFired) {
    log("ℹ️ L'employé jdupont est déjà marqué comme licencié.", "info");
    return;
  }
  state.employeeFired = true;
  render();
  log("🔥 L'employé jdupont vient d'être licencié. Son compte est toujours actif sur le serveur.", "warn");
}

function runScript() {
  log("▶️ Exécution du script de maintenance planifié...", "info");

  const codeReview = $("#defCodeReview").checked;
  const leastPriv = $("#defLeastPriv").checked;
  const monitoring = $("#defMonitoring").checked;
  const backups = $("#defBackups").checked;

  // Sauvegarde automatique si activée
  if (backups && !state.attackHappened) {
    state.backupSnapshot = state.files.map((f) => ({ ...f }));
    log("💾 Sauvegarde automatique effectuée avant l'exécution du script.", "good");
  }

  // 1. Revue de code : la bombe n'a jamais été déployée
  if (codeReview) {
    log("🔍 Revue de code : une condition suspecte a été détectée dans le script (« si licencié ou date limite atteinte → suppression massive »).", "good");
    log("✅ Le code a été rejeté avant la mise en production. La bombe logique n'a jamais été déployée. Aucun dégât.", "good");
    return;
  }

  // 2. Vérification de la condition de déclenchement
  const dateLimite = new Date(DATE_LIMITE);
  const triggerMet = state.employeeFired || state.currentDate >= dateLimite;

  if (!triggerMet) {
    log("ℹ️ Aucune condition de déclenchement n'est remplie (employé actif et date < limite). Le script s'exécute normalement.", "info");
    return;
  }

  log("🧨 Condition de déclenchement remplie ! La charge utile de la bombe logique s'active...", "warn");

  // 3. Surveillance comportementale : blocage avant tout dégât
  if (monitoring) {
    log("🛡️ Le système de surveillance comportementale (EDR/SIEM) détecte la tentative de suppression massive de fichiers et isole immédiatement le processus.", "good");
    log("✅ Attaque bloquée avant tout dégât.", "good");
    return;
  }

  // 4. Exécution de la charge malveillante
  state.attackHappened = true;
  let cibles = state.files.filter((f) => !f.deleted);

  if (leastPriv) {
    cibles = cibles.slice(0, 1);
    log("⚠️ La charge malveillante tente de tout supprimer, mais le compte utilisé ne dispose que de droits limités (principe du moindre privilège).", "warn");
  } else {
    log("🚨 ALERTE : suppression massive de fichiers en cours sur le serveur de production !", "bad");
  }

  cibles.forEach((f) => {
    f.deleted = true;
  });
  render();

  if (cibles.length === 0) {
    log("ℹ️ Tous les fichiers ciblés étaient déjà supprimés.", "info");
  } else if (cibles.length === state.files.length) {
    log("💥 Tous les fichiers du serveur de production ont été détruits.", "bad");
  } else {
    log(`💥 ${cibles.length} fichier(s) supprimé(s) : ${cibles.map((f) => f.name).join(", ")}.`, "bad");
  }

  // 5. Restauration possible si une sauvegarde existe
  if (backups && state.backupSnapshot) {
    log("💾 Une sauvegarde récente est disponible : vous pouvez restaurer les fichiers.", "good");
    $("#btnRestore").disabled = false;
  } else {
    log("❌ Aucune sauvegarde disponible : les données perdues ne peuvent pas être récupérées dans ce scénario.", "bad");
  }
}

function restoreFromBackup() {
  if (!state.backupSnapshot) return;
  state.files = state.backupSnapshot.map((f) => ({ ...f }));
  $("#btnRestore").disabled = true;
  render();
  log("✅ Fichiers restaurés à partir de la sauvegarde.", "good");
}

function resetSimulation() {
  resetState();
  $("#log").innerHTML = "";
  $("#btnRestore").disabled = true;
  ["defCodeReview", "defLeastPriv", "defMonitoring", "defBackups"].forEach((id) => {
    $("#" + id).checked = false;
  });
  render();
  log("🔄 Simulation réinitialisée.", "info");
}

function init() {
  $("#dateLimiteAffiche").textContent = formatDate(new Date(DATE_LIMITE));

  resetState();
  render();
  log("ℹ️ Simulation prête. Configurez les mesures de protection puis lancez le script.", "info");

  $("#btnAdvanceDate").addEventListener("click", advanceDate);
  $("#btnFireEmployee").addEventListener("click", fireEmployee);
  $("#btnRun").addEventListener("click", runScript);
  $("#btnRestore").addEventListener("click", restoreFromBackup);
  $("#btnReset").addEventListener("click", resetSimulation);
}

document.addEventListener("DOMContentLoaded", init);
