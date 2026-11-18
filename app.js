// Autotextes Softalmo : éditeur de feuille, génération et import d'autotextes, catalogue.
(function () {
  "use strict";

  var TAB = "{tab}", ENTER = "{enter}";
  var formulaire = null; // formulaire courant
  var valeurs = {};      // champ -> texte

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

  function generer(vals, form) {
    var ordre = form.ordre, premier = -1, dernier = -1;
    ordre.forEach(function (id, i) {
      if (id && (vals[id] || "").trim() !== "") { if (premier < 0) premier = i; dernier = i; }
    });
    if (premier < 0) return { texte: "", depart: null };
    var morceaux = [];
    for (var i = premier; i <= dernier; i++) {
      var id = ordre[i], v = id ? (vals[id] || "") : "";
      v = v.replace(/\r\n?/g, "\n");
      v = form.champs[id] && form.champs[id][1] === "zone" ? v.split("\n").join(ENTER) : v.replace(/\n/g, " ");
      morceaux.push(v);
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

  function copier(texte, bouton) {
    function ok() {
      if (!bouton) return;
      var avant = bouton.textContent;
      bouton.textContent = "Copié ✓";
      setTimeout(function () { bouton.textContent = avant; }, 1500);
    }
    function secours() {
      var t = el("textarea", { style: "position:fixed;opacity:0" });
      t.value = texte; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (e) { alert("Copie impossible : sélectionnez le texte et faites Ctrl+C."); }
      document.body.removeChild(t);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texte).then(ok, secours);
    else secours();
  }

  // ---------- Éditeur ----------

  function construireFeuille() {
    var feuille = $("#feuille");
    feuille.innerHTML = "";
    feuille.style.gridTemplateAreas = formulaire.page.map(function (l) { return '"' + l + '"'; }).join(" ");
    formulaire.zones.forEach(function (z) {
      var grille = el("div", { "class": "grille" });
      grille.style.gridTemplateColumns = z.cols;
      z.cellules.forEach(function (c) { grille.appendChild(cellule(c)); });
      var section = el("section", { "class": "zone teinte-" + z.teinte }, [el("h2", { texte: z.titre }), el("div", { "class": "defile" }, [grille])]);
      section.style.gridArea = z.id;
      feuille.appendChild(section);
    });
  }

  function cellule(c) {
    var n;
    if (c.c) {
      var id = c.c, champ;
      if (estZone(id)) champ = el("textarea", { rows: c.haut ? 5 : 3 });
      else champ = el("input", { type: "text" });
      champ.id = "champ-" + id;
      champ.setAttribute("aria-label", libelle(id));
      champ.title = libelle(id);
      champ.value = valeurs[id] || "";
      champ.addEventListener("input", function () { valeurs[id] = champ.value; majSortie(); });
      n = el("label", { "class": "cellule" + (c.petit ? " petit" : "") }, [
        c.lib ? el("span", { "class": "lib", texte: c.lib === 1 ? libelle(id) : c.lib }) : null, champ
      ]);
    } else {
      n = el("div", { "class": "texte " + (c.cls || "") }, [el("span", { texte: c.t })]);
      if (c.copie) {
        n.appendChild(el("button", { type: "button", "class": "copie", title: "Copier OD vers OG", texte: "OD → OG", onclick: function () {
          valeurs[c.copie[1]] = valeurs[c.copie[0]] || "";
          $("#champ-" + c.copie[1]).value = valeurs[c.copie[1]];
          majSortie();
        } }));
      }
    }
    if (c.col) n.style.gridColumn = c.col;
    if (c.row) n.style.gridRow = c.row;
    return n;
  }

  function remplir(vals) {
    valeurs = {};
    Object.keys(formulaire.champs).forEach(function (id) {
      var champ = $("#champ-" + id);
      if (champ) { valeurs[id] = vals[id] || ""; champ.value = valeurs[id]; }
    });
    majSortie();
  }

  function majSortie() {
    var r = generer(valeurs, formulaire);
    $("#sortie").value = r.texte;
    $("#depart").innerHTML = "";
    if (r.depart) {
      $("#depart").appendChild(document.createTextNode("Placez le curseur dans "));
      $("#depart").appendChild(el("strong", { texte: libelle(r.depart) }));
      $("#depart").appendChild(document.createTextNode(" avant d'insérer l'autotexte."));
    } else {
      $("#depart").textContent = "Remplissez la feuille : l'autotexte s'écrit au fur et à mesure.";
    }
    $("#compte").textContent = r.texte ? r.texte.length + " caractères" : "";
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

  // Signale le texte importé dans un champ que la feuille n'affiche pas (il serait perdu).
  function alertesMasques(vals) {
    return Object.keys(vals).filter(function (id) { return vals[id].trim() && !$("#champ-" + id); })
      .map(function (id) { return "Texte dans « " + libelle(id) + " », champ non affiché : il ne sera pas repris."; });
  }

  function afficherAlertes(alertes) {
    var zone = $("#alertes");
    zone.innerHTML = "";
    zone.hidden = !alertes.length;
    alertes.forEach(function (a) { zone.appendChild(el("li", { texte: a })); });
  }

  // ---------- Catalogue ----------

  function entreesDuFormulaire() {
    return (window.CATALOGUE || []).filter(function (e) { return e.formulaire === formulaire.id; });
  }

  function construireFiltres() {
    var entrees = entreesDuFormulaire();
    function options(sel, valeursPossibles, tous) {
      var avant = sel.value;
      sel.innerHTML = "";
      sel.appendChild(el("option", { value: "", texte: tous }));
      valeursPossibles.sort(function (a, b) { return a.localeCompare(b, "fr"); }).forEach(function (v) {
        sel.appendChild(el("option", { value: v, texte: v }));
      });
      sel.value = valeursPossibles.indexOf(avant) >= 0 ? avant : "";
    }
    var patho = [], parties = [];
    entrees.forEach(function (e) {
      if (patho.indexOf(e.pathologie) < 0) patho.push(e.pathologie);
      e.parties.forEach(function (p) { if (parties.indexOf(p) < 0) parties.push(p); });
    });
    options($("#filtre-patho"), patho, "Toutes les pathologies");
    options($("#filtre-partie"), parties, "Toutes les parties");
  }

  function construireCatalogue() {
    var patho = $("#filtre-patho").value, partie = $("#filtre-partie").value;
    var liste = $("#liste");
    liste.innerHTML = "";
    var entrees = entreesDuFormulaire().filter(function (e) {
      return (!patho || e.pathologie === patho) && (!partie || e.parties.indexOf(partie) >= 0);
    });
    if (!entrees.length) liste.appendChild(el("p", { "class": "vide", texte: "Aucun autotexte pour ce filtre." }));
    entrees.forEach(function (e) {
      var r = lire(e.autotexte, e.depart, formulaire);
      var apercu = el("dl", { "class": "apercu" });
      formulaire.ordre.forEach(function (id) {
        if (id && (r.vals[id] || "").trim()) {
          apercu.appendChild(el("dt", { texte: libelle(id) }));
          apercu.appendChild(el("dd", { texte: r.vals[id] }));
        }
      });
      var boutonCopier = el("button", { type: "button", "class": "principal", texte: "Copier l'autotexte" });
      boutonCopier.addEventListener("click", function () { copier(e.autotexte, boutonCopier); });
      liste.appendChild(el("article", { "class": "carte" }, [
        el("h3", { texte: e.titre }),
        el("p", { "class": "etiquettes" }, [el("span", { texte: e.pathologie })].concat(e.parties.map(function (p) { return el("span", { "class": "partie", texte: p }); }))),
        el("p", { "class": "depart" }, [document.createTextNode("Curseur dans "), el("strong", { texte: libelle(e.depart) })]),
        el("details", {}, [el("summary", { texte: "Voir le contenu" }), apercu]),
        el("div", { "class": "actions" }, [
          boutonCopier,
          el("button", { type: "button", texte: "Ouvrir dans l'éditeur", onclick: function () {
            location.hash = "#editeur";
            remplir(r.vals);
            afficherAlertes(r.alertes.concat(alertesMasques(r.vals)));
          } })
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
  }

  function choisirFormulaire(id) {
    formulaire = window.FORMULAIRES.filter(function (f) { return f.id === id; })[0] || window.FORMULAIRES[0];
    valeurs = {};
    $("#remarques").innerHTML = "";
    (formulaire.remarques || []).forEach(function (r) { $("#remarques").appendChild(el("li", { texte: r })); });
    construireFeuille();
    majSortie();
    afficherAlertes([]);
    construireFiltres();
    construireCatalogue();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var sel = $("#formulaire");
    window.FORMULAIRES.forEach(function (f) { sel.appendChild(el("option", { value: f.id, texte: f.nom })); });
    sel.addEventListener("change", function () {
      if (Object.keys(valeurs).some(function (k) { return valeurs[k]; }) && !confirm("Changer de formulaire efface la feuille. Continuer ?")) {
        sel.value = formulaire.id; return;
      }
      choisirFormulaire(sel.value);
    });
    $("#copier").addEventListener("click", function () { copier($("#sortie").value, $("#copier")); });
    $("#effacer").addEventListener("click", function () {
      if (confirm("Effacer toute la feuille ?")) { remplir({}); afficherAlertes([]); }
    });
    $("#importer").addEventListener("click", ouvrirImport);
    $("#import-form").addEventListener("submit", validerImport);
    $("#import-annuler").addEventListener("click", function () { $("#import").close(); });
    $("#filtre-patho").addEventListener("change", construireCatalogue);
    $("#filtre-partie").addEventListener("change", construireCatalogue);
    window.addEventListener("hashchange", afficherVue);
    choisirFormulaire(window.FORMULAIRES[0].id);
    afficherVue();
  });

  // Pour les tests en console.
  window.Autotextes = { generer: generer, lire: lire };
})();
