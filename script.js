document.getElementById("triageForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = new FormData(this);
  const data = Object.fromEntries(form.entries());

  const checked = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map((c) => c.name);

  // ----------------------------
  // TRIÁŽNÍ ALGORITMUS (DEMO)
  // ----------------------------

  let priority = "T5"; // default

  // --- T1 (okamžitě) ---
  const t1 = [
    "a_duch",
    "a_otok",
    "b_modrani",
    "c_krvaceni",
    "c_hrudnik",
    "d_vedomi",
    "d_krece",
    "neuro_koutek",
    "neuro_rec",
    "neuro_videni",
    "neuro_vedomi",
  ];
  if (checked.some((c) => t1.includes(c)) || data.b_dychani === "nemohu") {
    priority = "T1";
  }

  // --- T2 ---
  const t2 = ["dusnost_stredni", "uraz_mech", "c_tep"];
  if (priority === "T5" || priority === "T4" || priority === "T3") {
    if (
      data.b_dychani === "vyrazne" ||
      Number(data.bolest_skala) >= 7 ||
      checked.some((c) => t2.includes(c))
    ) {
      priority = "T2";
    }
  }

  // --- T3 ---
  if (priority === "T5" || priority === "T4") {
    if (Number(data.bolest_skala) >= 4 || data.dusnost === "stredni") {
      priority = "T3";
    }
  }

  // --- T4 ---
  if (priority === "T5") {
    if (Number(data.bolest_skala) >= 1) {
      priority = "T4";
    }
  }

  // ----------------------------
  // ULOŽENÍ (demo → localStorage)
  // ----------------------------
  const record = {
    time: new Date().toISOString(),
    identifikace: {
      jmeno: data.jmeno,
      prijmeni: data.prijmeni,
      narozeni: data.narozeni,
      telefon: data.telefon,
    },
    checked,
    bolest: data.bolest_skala,
    dusnost: data.dusnost,
    priorita: priority,
  };

  const all = JSON.parse(localStorage.getItem("triageDemo") || "[]");
  all.push(record);
  localStorage.setItem("triageDemo", JSON.stringify(all, null, 2));

  // ----------------------------
  // ZOBRAZENÍ VÝSLEDKU
  // ----------------------------
  document.getElementById("triageForm").classList.add("hidden");

  const res = document.getElementById("result");
  res.classList.remove("hidden");

  let waitTime = {
    T1: "0 minut (okamžitě)",
    T2: "do 10 minut",
    T3: "do 30 minut",
    T4: "60–120 minut",
    T5: "dle vytíženosti (nízká priorita)",
  }[priority];

  res.innerHTML = `
    <h2>Údaje odeslány sestře ✅</h2>
    <p>Byli jste zařazeni do fronty podle naléhavosti.</p>
    <p><b>Orientační priorita: ${priority}</b></p>
    <p><b>Odhad čekací doby:</b> ${waitTime}</p>
    ${
      priority === "T1"
        ? "<p style='color:red'><b>Okamžitě počkejte na personál – kritický stav!</b></p>"
        : ""
    }
    <hr>
    <p><small>(Toto je DEMO – data jsou uložena pouze ve vašem prohlížeči.)</small></p>
  `;
});
