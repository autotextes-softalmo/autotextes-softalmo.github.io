// Définition des formulaires Softalmo.
// « ordre » = arrêts de tabulation dans l'ordre réel de Softalmo (relevé par calibration).
// Un arrêt « null » est invisible (bouton, case à cocher) : l'autotexte doit le traverser sans rien y écrire.
// Les champs « ligne » (une seule ligne) n'acceptent pas de retour à la ligne ; les « zone » si.

window.FORMULAIRES = [
  {
    id: "cs-base-besancon",
    nom: "CS BASE (CHU de Besançon)",
    calibration: "2026-11-18",
    remarques: [
      "Dans Softalmo, un champ d'une ligne est remplacé par l'autotexte ; une zone de texte reçoit le texte à la suite de son contenu."
    ],
    champs: {
      interne: ["Interne", "ligne"],
      senior: ["Médecin senior", "ligne"],
      orthoptiste: ["Orthoptiste", "ligne"],
      eleve: ["Élève orthoptiste", "ligne"],
      avis: ["Avis", "zone"],
      motif: ["Motif de la visite", "ligne"],
      adresse: ["Adressé par", "ligne"],
      histoire: ["Histoire de la maladie", "zone"],
      traitement: ["TT actuel", "zone"],
      hba1c: ["HbA1c", "ligne"],
      allergies: ["Allergies", "ligne"],
      kaliemie: ["Kaliémie", "ligne"],
      obj_od_sph: ["Objectif OD sphère", "ligne"],
      obj_od_cyl: ["Objectif OD cylindre", "ligne"],
      obj_od_axe: ["Objectif OD axe", "ligne"],
      obj_og_sph: ["Objectif OG sphère", "ligne"],
      obj_og_cyl: ["Objectif OG cylindre", "ligne"],
      obj_og_axe: ["Objectif OG axe", "ligne"],
      subj_od_sph: ["Subjectif OD sphère", "ligne"],
      subj_od_cyl: ["Subjectif OD cylindre", "ligne"],
      subj_od_axe: ["Subjectif OD axe", "ligne"],
      subj_og_sph: ["Subjectif OG sphère", "ligne"],
      subj_og_cyl: ["Subjectif OG cylindre", "ligne"],
      subj_og_axe: ["Subjectif OG axe", "ligne"],
      add_od: ["Addition OD", "ligne"],
      add_og: ["Addition OG", "ligne"],
      pio_air_od: ["PIO à l'air OD", "ligne"],
      pio_air_og: ["PIO à l'air OG", "ligne"],
      pio_apl_od: ["PIO à l'aplanation OD", "ligne"],
      pio_apl_og: ["PIO à l'aplanation OG", "ligne"],
      pachy_od: ["Pachymétrie OD", "ligne"],
      pachy_og: ["Pachymétrie OG", "ligne"],
      pio_corr_od: ["PIO corrigée OD", "ligne"],
      pio_corr_og: ["PIO corrigée OG", "ligne"],
      avsc_loin_od: ["AV sans correction loin OD", "ligne"],
      avsc_loin_og: ["AV sans correction loin OG", "ligne"],
      avsc_loin_bino: ["AV sans correction loin binoculaire", "ligne"],
      avsc_pres_od: ["AV sans correction près OD", "ligne"],
      avsc_pres_og: ["AV sans correction près OG", "ligne"],
      avsc_pres_bino: ["AV sans correction près binoculaire", "ligne"],
      av_loin_od: ["Acuité subjective loin OD", "ligne"],
      av_loin_og: ["Acuité subjective loin OG", "ligne"],
      av_loin_bino: ["Acuité subjective loin binoculaire", "ligne"],
      av_pres_od: ["Acuité subjective près OD", "ligne"],
      av_pres_og: ["Acuité subjective près OG", "ligne"],
      av_pres_bino: ["Acuité subjective près binoculaire", "ligne"],
      ts_od: ["TS OD", "ligne"],
      ts_og: ["TS OG", "ligne"],
      etdrs_od: ["ETDRS OD", "ligne"],
      etdrs_og: ["ETDRS OG", "ligne"],
      av_note: ["Remarque acuité", "zone"],
      laf_od: ["Lampe à fente OD", "zone"],
      laf_og: ["Lampe à fente OG", "zone"],
      flare_od: ["Laser flare OD", "ligne"],
      flare_og: ["Laser flare OG", "ligne"],
      fo_od: ["Fond d'œil OD", "zone"],
      fo_og: ["Fond d'œil OG", "zone"],
      gonio_od: ["Gonioscopie OD", "zone"],
      gonio_og: ["Gonioscopie OG", "zone"],
      octp_od: ["OCT papille OD", "zone"],
      octp_og: ["OCT papille OG", "zone"],
      rnfl_od: ["RNFL moyen OD", "ligne"],
      rnfl_og: ["RNFL moyen OG", "ligne"],
      octm_od: ["OCT maculaire OD", "zone"],
      octm_og: ["OCT maculaire OG", "zone"],
      cmt_od: ["CMT OD", "ligne"],
      cmt_og: ["CMT OG", "ligne"],
      paup_od: ["Paupières OD", "zone"],
      paup_og: ["Paupières OG", "zone"],
      motilite: ["Motilité", "zone"],
      commentaire: ["Commentaire", "zone"],
      conclusion: ["Conclusion / conduite à tenir", "zone"],
      rdv: ["Prochain RDV", "zone"],
      diag_od: ["Diagnostics marquants OD", "zone"],
      diag_og: ["Diagnostics marquants OG", "zone"]
    },
    ordre: [
      "interne", "senior", "orthoptiste", "eleve", "avis",
      "motif", "adresse", "histoire", "traitement", "hba1c", "allergies",
      "obj_od_sph", "obj_od_cyl", "obj_od_axe", "obj_og_sph", "obj_og_cyl", "obj_og_axe",
      "subj_od_sph", "subj_od_cyl", "subj_od_axe", "subj_og_sph", "subj_og_cyl", "subj_og_axe",
      "add_od", "add_og",
      "pio_air_od", "pio_air_og", "pio_apl_od", "pio_apl_og",
      "pachy_od", "pachy_og", "pio_corr_od", "pio_corr_og",
      "avsc_loin_od", "avsc_loin_og", "avsc_loin_bino",
      "avsc_pres_od", "avsc_pres_og", "avsc_pres_bino",
      "av_loin_od", "av_loin_og", "av_loin_bino",
      "av_pres_od", "av_pres_og", "av_pres_bino",
      "ts_od", "ts_og", "etdrs_od", "etdrs_og", "av_note",
      "laf_od", null, "laf_og", "flare_od", "flare_og",
      "fo_od", null, "fo_og",
      "gonio_od", null, "gonio_og",
      "octp_od", null, "octp_og", "rnfl_od", "rnfl_og",
      "octm_od", null, "octm_og", "cmt_od", "cmt_og",
      "paup_od", null, "paup_og",
      "motilite", "commentaire",
      "conclusion", null, "rdv", null, "diag_od", null, "diag_og",
      "kaliemie"
    ],
    // Disposition : rangées de la page, puis zones.
    // Rangée : { zones: [...] } sur toute la largeur, ou { zones: [principale], droite: [...] } avec une colonne de droite
    // calée sur la hauteur de la zone principale ; "autotexte" y place le bloc Autotexte, la dernière zone s'étire.
    // Zone « grille » : cols = nombre de colonnes ; cellule { c: champ, span, lignes, lib } ou { note }.
    // Zone « bilaterale » : lignes { lib, od, og, lignes } (OD | libellé | OG) ou { c, lignes } sur toute la largeur.
    // lignes = hauteur d'une zone de texte. Teinte : gris, jaune, orange, rose.
    // Non affichés (arrêts gardés dans « ordre ») : avis, réfraction, pression, acuité, laser flare, RNFL, CMT, diagnostics marquants.
    page: [
      { zones: ["equipe"] },
      { zones: ["anamnese"] },
      { zones: ["examen"], droite: ["conclusions", "autotexte"] }
    ],
    zones: [
      { id: "equipe", titre: "Équipe", teinte: "gris", cols: 4, cellules: [
        { c: "interne" }, { c: "senior" }, { c: "orthoptiste" }, { c: "eleve" }
      ] },
      { id: "anamnese", titre: "Anamnèse", teinte: "jaune", cols: 6, cellules: [
        { c: "motif", span: 4 }, { c: "adresse", span: 2 },
        { c: "histoire", span: 4, lignes: 4, lib: "Histoire de la maladie / symptomatologie" }, { c: "traitement", span: 2, lignes: 4 },
        { c: "allergies", span: 4 }, { c: "hba1c" }, { c: "kaliemie" }
      ] },
      { id: "examen", titre: "Examen clinique", teinte: "orange", type: "bilaterale", lignes: [
        { lib: "Lampe à fente", od: "laf_od", og: "laf_og", lignes: 5 },
        { lib: "Fond d'œil", od: "fo_od", og: "fo_og", lignes: 5 },
        { lib: "Gonioscopie", od: "gonio_od", og: "gonio_og", lignes: 3 },
        { lib: "OCT papille", od: "octp_od", og: "octp_og", lignes: 1 },
        { lib: "OCT maculaire", od: "octm_od", og: "octm_og", lignes: 3 },
        { lib: "Paupières", od: "paup_od", og: "paup_og", lignes: 3 },
        { c: "motilite", lignes: 3 },
        { c: "commentaire", lignes: 2 }
      ] },
      { id: "conclusions", titre: "Conclusions", teinte: "rose", cols: 1, cellules: [
        { c: "conclusion", lignes: 10 }, { c: "rdv", lignes: 3 },
        { note: "Traitement prescrit : hors du parcours de tabulation, à remplir à la main dans Softalmo." }
      ] }
    ]
  }
];
