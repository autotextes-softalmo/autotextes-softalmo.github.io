// Autotextes Softalmo : éditeur de feuille, génération et import d'autotextes, catalogue.
(function () {
  "use strict";

  var TAB = "{tab}", ENTER = "{enter}";
  var formulaire = null; // formulaire courant
  var valeurs = {};      // champ -> texte
  var iconeCopie;

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  function el(tag, attrs, enfants) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "texte") n.textContent = attrs[k];
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (enfants || []).forEach(function (e) { if (e) n.appendChild(e); });
    return n;
  }
  function libelle(id) { return formulaire.champs[id][0]; }
  function estZone(id) { return formulaire.champs[id][1] === "zone"; }

  // ---------- Génération et lecture d'un autotexte ----------

  function encoderChamp(valeur, multiligne) {
    valeur = valeur.replace(/\r\n?/g, "\n");
    return valeur.replace(/\n/g, multiligne ? ENTER : " ");
  }

  function generer(vals, form) {
    var ordre = form.ordre, premier = -1, dernier = -1;
    ordre.forEach(function (id, i) {
      if (id && (vals[id] || "").trim() !== "") { if (premier < 0) premier = i; dernier = i; }
    });
    if (premier < 0) return { texte: "", depart: null };
    var morceaux = [];
    for (var i = premier; i <= dernier; i++) {
      var id = ordre[i], v = id ? (vals[id] || "") : "";
      morceaux.push(encoderChamp(v, id && estZoneDe(form, id)));
    }
    return { texte: morceaux.join(TAB), depart: ordre[premier] };
  }

  // Renvoie { vals, alertes } à partir d'un autotexte et du champ de départ.
  function lire(texte, depart, form) {
    var vals = {}, alertes = [];
    var propre = texte.replace(/\r?\n$/, "");
    var codes = propre.match(/\{[^}]*\}/g) || [];
    codes.forEach(function (c) {
      if (!/^\{(tab|enter)\}$/i.test(c)) alertes.push("Code inconnu « " + c + " » laissé tel quel.");
    });
    var morceaux = propre.split(/\{tab\}/i);
    var debut = form.ordre.indexOf(depart);
    morceaux.forEach(function (m, k) {
      var v = m.split(/\{enter\}/i).join("\n");
      var i = debut + k, id = form.ordre[i];
      if (i >= form.ordre.length) {
        if (v.trim()) alertes.push("Texte au-delà du dernier champ connu, ignoré : « " + v.slice(0, 40) + " ».");
      } else if (!id) {
        if (v.trim()) alertes.push("Texte tombé sur un arrêt invisible (bouton ou case), ignoré : « " + v.slice(0, 40) + " ».");
      } else {
        if (!estZoneDe(form, id) && v.indexOf("\n") >= 0) alertes.push("Retour à la ligne dans « " + form.champs[id][0] + " » (champ d'une ligne).");
        vals[id] = v;
      }
    });
    return { vals: vals, alertes: alertes };
  }
  function estZoneDe(form, id) { return form.champs[id][1] === "zone"; }

  // ---------- Presse-papiers ----------

  var retoursCopie = new WeakMap();

  function copier(texte, etiquette, confirmation) {
    function ok() {
      var retour = retoursCopie.get(etiquette) || { avant: etiquette.textContent };
      clearTimeout(retour.delai);
      etiquette.textContent = confirmation || "Copié ✓";
      retour.delai = setTimeout(function () {
        etiquette.textContent = retour.avant;
        retoursCopie.delete(etiquette);
      }, 1500);
      retoursCopie.set(etiquette, retour);
    }
    function secours() {
      var actif = document.activeElement, reussi = false;
      var t = el("textarea", { style: "position:fixed;opacity:0" });
      t.value = texte; document.body.appendChild(t); t.select();
      try { reussi = document.execCommand("copy"); } catch (e) { /* Commande indisponible. */ }
      document.body.removeChild(t);
      actif.focus({ preventScroll: true });
      if (reussi) ok();
      else alert("Impossible de copier dans le presse-papiers.");
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texte).then(ok, secours);
    else secours();
  }

  // ---------- Éditeur ----------

  // Pages et zones viennent de formulaires.js : rien n'est propre à un formulaire ici.
  function construireFeuille() {
    var feuille = $("#feuille"), bloc = $("#bloc-autotexte"), place = false;
    feuille.innerHTML = "";
    var parId = {};
    formulaire.zones.forEach(function (z) { parId[z.id] = z; });
    formulaire.page.forEach(function (r) {
      var rangee = el("div", { "class": "rangee" + (r.droite ? " avec-droite" : "") });
      r.zones.forEach(function (id) { rangee.appendChild(zone(parId[id])); });
      if (r.droite) {
        var pile = el("div", { "class": "pile" });
        r.droite.forEach(function (id) {
          if (id === "autotexte") { pile.appendChild(bloc); place = true; }
          else pile.appendChild(zone(parId[id]));
        });
        var etirables = pile.querySelectorAll(".zone:not(.autotexte)");
        if (etirables.length) etirables[etirables.length - 1].classList.add("etire");
        rangee.appendChild(el("div", { "class": "droite" }, [pile]));
      }
      feuille.appendChild(rangee);
    });
    if (!place) feuille.appendChild(bloc);
  }

  function zone(z) {
    var titre = el("h2", { id: "zone-" + z.id, texte: z.titre }), corps;
    if (z.type === "bilaterale") {
      corps = el("div", { "class": "bilaterale" }, [
        el("div", { "class": "entetes", "aria-hidden": "true" }, [el("span", { texte: "OD" }), el("span"), el("span", { texte: "OG" })])
      ]);
      z.lignes.forEach(function (l) {
        if (l.c) {
          corps.appendChild(el("div", { "class": "ligne-unique" }, [
            el("label", { "for": "champ-" + l.c, texte: l.lib || libelle(l.c) }),
            saisie(l.c, l.lignes)
          ]));
        } else {
          corps.appendChild(el("div", { "class": "ligne-bilat" }, [
            saisie(l.od, l.lignes, l.lib + " OD"), el("span", { "class": "lib-ligne", texte: l.lib }), saisie(l.og, l.lignes, l.lib + " OG")
          ]));
        }
      });
    } else {
      corps = el("div", { "class": "grille" });
      corps.style.gridTemplateColumns = "repeat(" + (z.cols || 1) + ", minmax(0, 1fr))";
      z.cellules.forEach(function (c) {
        var n = c.note ? el("p", { "class": "note", texte: c.note })
          : el("div", { "class": "cellule" }, [
            el("label", { "for": "champ-" + c.c, texte: c.lib || libelle(c.c) }),
            saisie(c.c, c.lignes)
          ]);
        n.style.gridColumn = c.note ? "1 / -1" : "span " + (c.span || 1);
        corps.appendChild(n);
      });
    }
    return el("section", { "class": "zone teinte-" + z.teinte, "aria-labelledby": "zone-" + z.id }, [titre, corps]);
  }

  function saisie(id, lignes, aria) {
    var champ = estZone(id) ? el("textarea", { rows: lignes || 3 }) : el("input", { type: "text" });
    champ.id = "champ-" + id;
    champ.className = "saisie";
    if (aria) champ.setAttribute("aria-label", aria);
    champ.value = valeurs[id] || "";
    var retour = el("span", { "aria-hidden": "true" });
    var bouton = el("button", {
      type: "button", "class": "copier-champ", title: "Copier ce champ",
      "aria-label": "Copier le champ " + (aria || libelle(id)),
      onclick: function () { copier(encoderChamp(champ.value, estZone(id)), retour, "✓"); }
    }, [retour, iconeCopie.cloneNode(true)]);
    var conteneur = el("div", { "class": "conteneur-saisie" }, [champ, bouton]);
    bouton.hidden = !champ.value.trim();
    champ.addEventListener("input", function () {
      valeurs[id] = champ.value;
      actualiserChamp(champ);
      majSortie();
    });
    return conteneur;
  }

  function actualiserChamp(champ) {
    champ.nextElementSibling.hidden = !champ.value.trim();
    ajuster(champ);
  }

  // Une zone de texte grandit avec son contenu : rien n'est jamais coupé (hauteur minimale = « lignes »).
  function ajuster(champ) {
    if (champ.tagName !== "TEXTAREA") return;
    champ.style.height = "";
    if (champ.scrollHeight > champ.clientHeight) champ.style.height = (champ.scrollHeight + champ.offsetHeight - champ.clientHeight) + "px";
  }
  function ajusterTout() { document.querySelectorAll("#feuille textarea").forEach(ajuster); }

  function remplir(vals) {
    valeurs = {};
    Object.keys(formulaire.champs).forEach(function (id) {
      var champ = $("#champ-" + id);
      if (champ) {
        valeurs[id] = vals[id] || "";
        champ.value = valeurs[id];
        actualiserChamp(champ);
      }
    });
    majSortie();
  }

  function courant() { return generer(valeurs, formulaire).texte; }

  function majSortie() {
    var r = generer(valeurs, formulaire);
    $("#depart").innerHTML = "";
    if (r.depart) {
      $("#depart").appendChild(document.createTextNode("Placez le curseur dans "));
      $("#depart").appendChild(el("strong", { "class": "surligne", texte: libelle(r.depart) }));
      $("#depart").appendChild(document.createTextNode(" avant d'insérer l'autotexte."));
    } else {
      $("#depart").textContent = "Remplissez la feuille : l'autotexte s'écrit au fur et à mesure.";
    }
    $("#compte").textContent = r.texte ? r.texte.length.toLocaleString("fr-FR") + " caractères" : "";
    $("#copier").disabled = !r.texte;
  }

  // ---------- Import ----------

  function ouvrirImport() {
    var sel = $("#import-depart");
    sel.innerHTML = "";
    formulaire.ordre.forEach(function (id) {
      if (id) sel.appendChild(el("option", { value: id, texte: libelle(id) }));
    });
    sel.value = formulaire.ordre.indexOf("motif") >= 0 ? "motif" : formulaire.ordre.filter(Boolean)[0];
    $("#import-texte").value = "";
    $("#import").showModal();
  }

  function validerImport(e) {
    e.preventDefault();
    var r = lire($("#import-texte").value, $("#import-depart").value, formulaire);
    remplir(r.vals);
    $("#import").close();
    afficherAlertes(r.alertes.concat(alertesMasques(r.vals)));
  }

  // Un champ non affiché reste un arrêt de l'autotexte, mais invisible : le texte importé dessus serait perdu.
  function alertesMasques(vals) {
    return Object.keys(vals).filter(function (id) { return vals[id].trim() && !$("#champ-" + id); })
      .map(function (id) { return "Texte tombé sur un arrêt invisible (« " + libelle(id) + " », non affiché), ignoré : « " + vals[id].slice(0, 40) + " »."; });
  }

  function afficherAlertes(alertes) {
    var liste = $("#alertes-liste");
    liste.innerHTML = "";
    $("#alertes").hidden = !alertes.length;
    $("#alertes-resume").textContent = "Import : " + alertes.length + (alertes.length > 1 ? " points à vérifier." : " point à vérifier.");
    alertes.forEach(function (a) { liste.appendChild(el("li", { texte: a })); });
  }

  // ---------- Catalogue ----------

  function entreesDuFormulaire() {
    return (window.CATALOGUE || []).filter(function (e) { return e.formulaire === formulaire.id; });
  }

  var filtrePathologie = "";

  function construireFiltrePathologie() {
    var pathologies = Array.from(new Set(entreesDuFormulaire().map(function (e) { return e.pathologie; })));
    var conteneur = $("#filtre-patho");
    conteneur.innerHTML = "";
    if (pathologies.indexOf(filtrePathologie) < 0) filtrePathologie = "";
    [""].concat(pathologies.sort(function (a, b) { return a.localeCompare(b, "fr"); })).forEach(function (pathologie) {
      var bouton = el("button", {
        type: "button", "class": "pastille", texte: pathologie || "Toutes",
        "aria-pressed": String(filtrePathologie === pathologie),
        onclick: function () {
          filtrePathologie = pathologie;
          conteneur.querySelectorAll(".pastille").forEach(function (b) { b.setAttribute("aria-pressed", String(b === bouton)); });
          construireCatalogue();
        }
      });
      conteneur.appendChild(bouton);
    });
  }

  // Libellés courts des champs remplis, OD et OG regroupés.
  function resume(vals) {
    var vus = [], sortie = [];
    formulaire.ordre.forEach(function (id) {
      if (!id || !(vals[id] || "").trim() || vus.indexOf(id) >= 0) return;
      vus.push(id);
      var lib = libelle(id), m = lib.match(/^(.*) (OD|OG)$/);
      if (m) {
        var autre = Object.keys(formulaire.champs).filter(function (k) { return libelle(k) === m[1] + (m[2] === "OD" ? " OG" : " OD"); })[0];
        if (autre && (vals[autre] || "").trim()) { vus.push(autre); lib = m[1] + " OD/OG"; }
      }
      sortie.push(lib);
    });
    return sortie;
  }

  function normaliser(t) { return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  function construireCatalogue() {
    var q = normaliser($("#recherche").value.trim()), liste = $("#liste"), toutes = entreesDuFormulaire();
    liste.innerHTML = "";
    var entrees = toutes.filter(function (e) {
      return (!filtrePathologie || e.pathologie === filtrePathologie) &&
        (!q || normaliser([e.titre, e.pathologie, e.autotexte].join(" ")).indexOf(q) >= 0);
    });
    $("#catalogue-compte").textContent = toutes.length + (toutes.length > 1 ? " autotextes" : " autotexte") + " pour " + formulaire.nom;
    if (!entrees.length) liste.appendChild(el("p", { "class": "vide", texte: "Aucun autotexte pour ce filtre." }));
    entrees.forEach(function (e) {
      var r = lire(e.autotexte, e.depart, formulaire), n = 0;
      var apercu = el("dl", { "class": "apercu" });
      formulaire.ordre.forEach(function (id) {
        if (id && (r.vals[id] || "").trim()) {
          n++;
          apercu.appendChild(el("dt", { texte: libelle(id) }));
          apercu.appendChild(el("dd", { texte: r.vals[id] }));
        }
      });
      var boutonCopier = el("button", { type: "button", texte: "Copier l'autotexte" });
      boutonCopier.addEventListener("click", function () { copier(e.autotexte, boutonCopier); });
      liste.appendChild(el("article", { "class": "carte" }, [
        el("div", { "class": "lisere", "aria-hidden": "true" }),
        el("div", { "class": "corps" }, [
          el("h3", { texte: e.titre }),
          el("p", { "class": "etiquettes" }, [el("span", { texte: e.pathologie })]),
          el("p", { "class": "depart" }, [document.createTextNode("Curseur dans "), el("strong", { texte: libelle(e.depart) })]),
          el("p", { "class": "resume", texte: resume(r.vals).join(" · ") }),
          el("details", {}, [el("summary", { texte: "Voir le contenu (" + n + (n > 1 ? " champs)" : " champ)") }), apercu])
        ]),
        el("div", { "class": "pied" }, [
          el("button", { type: "button", "class": "principal", texte: "Ouvrir dans l'éditeur", onclick: function () {
            location.hash = "#editeur";
            remplir(r.vals);
            afficherAlertes(r.alertes.concat(alertesMasques(r.vals)));
          } }),
          boutonCopier
        ])
      ]));
    });
  }

  // ---------- Navigation ----------

  function afficherVue() {
    var vue = location.hash === "#catalogue" ? "catalogue" : "editeur";
    $("#vue-editeur").hidden = vue !== "editeur";
    $("#vue-catalogue").hidden = vue !== "catalogue";
    document.querySelectorAll(".onglets a").forEach(function (a) {
      a.setAttribute("aria-current", a.getAttribute("href") === "#" + vue ? "page" : "false");
    });
    window.scrollTo(0, 0);
    if (vue === "editeur") ajusterTout();
  }

  function choisirFormulaire(id) {
    formulaire = window.FORMULAIRES.filter(function (f) { return f.id === id; })[0] || window.FORMULAIRES[0];
    valeurs = {};
    $("#remarques").innerHTML = "";
    (formulaire.remarques || []).forEach(function (r) { $("#remarques").appendChild(el("li", { texte: r })); });
    construireFeuille();
    majSortie();
    afficherAlertes([]);
    construireFiltrePathologie();
    construireCatalogue();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var sel = $("#formulaire");
    iconeCopie = $("#copier svg");
    window.FORMULAIRES.forEach(function (f) { sel.appendChild(el("option", { value: f.id, texte: f.nom })); });
    sel.addEventListener("change", function () {
      if (Object.keys(valeurs).some(function (k) { return valeurs[k]; }) && !confirm("Changer de formulaire efface la feuille. Continuer ?")) {
        sel.value = formulaire.id; return;
      }
      choisirFormulaire(sel.value);
    });
    $("#copier").addEventListener("click", function () { copier(courant(), $("#copier .etiquette")); });
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.shiftKey && !e.altKey && (e.key === "C" || e.key === "c") && !$("#vue-editeur").hidden && courant()) {
        e.preventDefault();
        copier(courant(), $("#copier .etiquette"));
      }
    });
    $("#alertes-masquer").addEventListener("click", function () { afficherAlertes([]); });
    $("#effacer").addEventListener("click", function () {
      if (confirm("Effacer toute la feuille ?")) { remplir({}); afficherAlertes([]); }
    });
    $("#importer").addEventListener("click", ouvrirImport);
    $("#import-form").addEventListener("submit", validerImport);
    $("#import-annuler").addEventListener("click", function () { $("#import").close(); });
    $("#recherche").addEventListener("input", construireCatalogue);
    window.addEventListener("hashchange", afficherVue);
    window.addEventListener("resize", ajusterTout);
    choisirFormulaire(window.FORMULAIRES[0].id);
    afficherVue();
  });

  // Pour les tests en console.
  window.Autotextes = { generer: generer, lire: lire, courant: courant };
})();
