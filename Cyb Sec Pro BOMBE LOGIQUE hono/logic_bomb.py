"""
logic_bomb.py — CHARGE MALVEILLANTE *SIMULEE* (bombe logique).

AVERTISSEMENT PEDAGOGIQUE
    Ce module est 100% factice. Il ne touche AUCUN fichier, AUCUN
    systeme et AUCUNE donnee reelle : il modifie seulement en memoire
    une liste de dictionnaires Python representant de fausses commandes.
    Il illustre, dans un projet scolaire de cybersecurite, le
    fonctionnement d'une bombe logique.

QU'EST-CE QU'UNE BOMBE LOGIQUE ?
    Un fragment de code DORMANT, dissimule dans une application
    legitime, qui reste inactif jusqu'a ce qu'une CONDITION soit
    remplie (une date, le licenciement de son auteur, l'absence d'un
    interrupteur regulierement actionne...). Quand la condition devient
    vraie, la CHARGE UTILE (payload) s'execute et provoque les degats.

Ce fichier est volontairement SEPARE du code du site (app.py) pour
montrer la frontiere entre le code malveillant (ici, l'attaquant) et le
code legitime + la defense (app.py, l'entreprise).
"""

from datetime import date

# ---------------------------------------------------------------------------
# 1. CONDITION DE DECLENCHEMENT (la "gachette")
# ---------------------------------------------------------------------------

# Date a partir de laquelle la bombe s'arme toute seule.
DATE_GACHETTE = date(2026, 6, 20)


def condition_remplie(contexte):
    """Retourne (booleen, raison). Evalue si la bombe doit se declencher."""
    # Declencheur 1 : "dead man's switch" — l'auteur a ete licencie,
    # son compte n'actionne plus l'interrupteur de securite.
    if contexte.get("employe_licencie"):
        return True, "l'auteur du code a ete licencie (dead man's switch)"

    # Declencheur 2 : declenchement temporel a la date prevue.
    date_courante = contexte.get("date_courante")
    if date_courante and date_courante >= DATE_GACHETTE:
        return True, "la date gachette du %s est atteinte" % DATE_GACHETTE.strftime("%d/%m/%Y")

    return False, "aucune condition de declenchement n'est remplie"


# ---------------------------------------------------------------------------
# 2. CHARGE UTILE (le "payload")
# ---------------------------------------------------------------------------

# Marqueur laisse dans les donnees corrompues : c'est exactement ce type
# de signature qu'un outil de detection (EDR/SIEM) recherchera.
STATUT_CORROMPU = "CORROMPUE"


def charge_utile(commandes):
    """Corrompt toutes les commandes (SIMULE). Retourne le nb corrompu.

    Dans une vraie attaque, le payload chiffrerait/supprimerait des
    fichiers. Ici on se contente de marquer les commandes comme
    CORROMPUE, de mettre le montant a zero et de masquer le client.
    """
    nb = 0
    for c in commandes:
        c["statut"] = STATUT_CORROMPU
        c["montant"] = 0
        c["client"] = "********"
        nb += 1
    return nb
