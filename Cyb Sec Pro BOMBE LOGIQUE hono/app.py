"""
app.py — LE SITE LEGITIME (Flask).

Application metier fictive : un petit back-office qui gere des
"commandes" clients. C'est l'application dans laquelle un developpeur
malveillant a glisse une bombe logique (voir logic_bomb.py).

Ce fichier contient :
    - les routes du site et l'etat (donnees) en memoire ;
    - la tache planifiee "maintenance_nocturne" qui, a son insu,
      appelle la bombe logique ;
    - la DEFENSE : l'analyse de securite et la restauration.

Lancement :  python app.py   ->   http://localhost:5000
"""

import copy
from datetime import datetime, date

from flask import Flask, render_template, jsonify

import logic_bomb  # <-- le code malveillant, dans un fichier separe

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Donnees metier de depart (fausses commandes)
# ---------------------------------------------------------------------------
COMMANDES_INITIALES = [
    {"id": "CMD-1001", "client": "Alice Martin",   "produit": "Ordinateur portable", "montant": 1299, "statut": "Validee"},
    {"id": "CMD-1002", "client": "Bob Lefevre",    "produit": "Ecran 27\"",          "montant": 329,  "statut": "Validee"},
    {"id": "CMD-1003", "client": "Chloe Nguyen",   "produit": "Clavier mecanique",   "montant": 119,  "statut": "En cours"},
    {"id": "CMD-1004", "client": "David Costa",    "produit": "Casque audio",        "montant": 199,  "statut": "Validee"},
    {"id": "CMD-1005", "client": "Emma Rousseau",  "produit": "Station d'accueil",   "montant": 249,  "statut": "Expediee"},
    {"id": "CMD-1006", "client": "Farid Benali",   "produit": "Webcam 4K",           "montant": 159,  "statut": "En cours"},
]

# Etat global de l'application (demo mono-utilisateur).
etat = {}


def init_etat():
    """(Re)initialise l'etat : commandes saines, sauvegarde, journal."""
    global etat
    etat = {
        "commandes": copy.deepcopy(COMMANDES_INITIALES),
        # Sauvegarde hors-ligne saine (regle 3-2-1) -> sert a restaurer.
        "sauvegarde": copy.deepcopy(COMMANDES_INITIALES),
        "journal": [],
        "attaque_active": False,
        "attaque_detectee": False,
    }
    journal("Systeme demarre. %d commandes chargees, sauvegarde saine disponible."
            % len(etat["commandes"]), "good")


def journal(message, niveau="info"):
    """Ajoute une entree horodatee au journal des evenements."""
    etat["journal"].append({
        "heure": datetime.now().strftime("%H:%M:%S"),
        "message": message,
        "niveau": niveau,  # info | good | warn | bad
    })


def etat_public():
    """Vue de l'etat renvoyee au navigateur (JSON)."""
    nb_corrompues = sum(1 for c in etat["commandes"]
                        if c["statut"] == logic_bomb.STATUT_CORROMPU)
    if etat["attaque_active"]:
        systeme = "COMPROMIS"
    elif etat["attaque_detectee"]:
        systeme = "EN ANALYSE"
    else:
        systeme = "SAIN"
    return jsonify({
        "commandes": etat["commandes"],
        "journal": etat["journal"],
        "attaque_active": etat["attaque_active"],
        "attaque_detectee": etat["attaque_detectee"],
        "nb_corrompues": nb_corrompues,
        "systeme": systeme,
    })


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/etat")
def api_etat():
    return etat_public()


@app.route("/api/trigger", methods=["POST"])
def api_trigger():
    """Simule l'execution de la tache planifiee qui contient la bombe."""
    journal("Execution de la tache planifiee 'maintenance_nocturne'...", "info")

    # Contexte declencheur : ici on simule un auteur licencie.
    contexte = {"employe_licencie": True, "date_courante": date.today()}
    declenche, raison = logic_bomb.condition_remplie(contexte)

    if declenche:
        journal("Condition de declenchement remplie : %s." % raison, "warn")
        nb = logic_bomb.charge_utile(etat["commandes"])  # <-- payload
        etat["attaque_active"] = True
        etat["attaque_detectee"] = False
        journal("BOMBE LOGIQUE DECLENCHEE : %d commandes corrompues." % nb, "bad")
    else:
        journal("Tache terminee normalement : %s." % raison, "good")

    return etat_public()


@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    """DEFENSE : detection de l'attaque (analyse type EDR/SIEM)."""
    journal("Lancement de l'analyse de securite (EDR/SIEM)...", "info")
    corrompues = [c for c in etat["commandes"]
                  if c["statut"] == logic_bomb.STATUT_CORROMPU]

    if corrompues:
        etat["attaque_detectee"] = True
        journal("ALERTE : %d commandes a l'etat %s detectees."
                % (len(corrompues), logic_bomb.STATUT_CORROMPU), "bad")
        journal("Signature identifiee : bombe logique (charge_utile dans "
                "la tache planifiee).", "warn")
        journal("Recommandation : isoler le systeme puis restaurer depuis "
                "une sauvegarde saine.", "info")
    else:
        journal("Aucune anomalie detectee. Le systeme est sain.", "good")

    return etat_public()


@app.route("/api/restore", methods=["POST"])
def api_restore():
    """DEFENSE : restauration depuis la sauvegarde saine."""
    if not etat["attaque_active"]:
        journal("Rien a restaurer : le systeme est deja sain.", "info")
    else:
        journal("Restauration depuis la sauvegarde saine (regle 3-2-1)...", "info")
        etat["commandes"] = copy.deepcopy(etat["sauvegarde"])
        etat["attaque_active"] = False
        etat["attaque_detectee"] = False
        journal("Restauration terminee : toutes les commandes sont retablies.", "good")

    return etat_public()


@app.route("/api/reset", methods=["POST"])
def api_reset():
    """Remet toute la simulation a zero."""
    init_etat()
    return etat_public()


# ---------------------------------------------------------------------------
init_etat()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
