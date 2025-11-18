document.getElementById("triageForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = new FormData(this);
  const data = Object.fromEntries(form.entries());

  const checked = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map((c) => c.name);

  let priority = "ESI5"; // default

  // --- ESI1 (okamžitě) ---
  const ESI1 = [
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
  if (checked.some((c) => ESI1.includes(c)) || data.b_dychani === "nemohu") {
    priority = "ESI1";
  }

  // --- ESI2 ---
  const ESI2 = ["dusnost_stredni", "uraz_mech", "c_tep"];
  if (priority === "ESI5" || priority === "ESI4" || priority === "ESI3") {
    if (
      data.b_dychani === "vyrazne" ||
      Number(data.bolest_skala) >= 7 ||
      checked.some((c) => ESI2.includes(c)) ||
      data.dusnost === "těžká"
    ) {
      priority = "ESI2";
    }
  }

  // --- ESI3 ---
  if (priority === "ESI5" || priority === "ESI4") {
    if (Number(data.bolest_skala) >= 4 || data.dusnost === "střední") {
      priority = "ESI3";
    }
  }

  // --- ESI4 ---
  if (priority === "ESI5") {
    if (Number(data.bolest_skala) >= 1) {
      priority = "ESI4";
    }
  }

  // ULOŽENÍ (demo → localStorage)
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

  // ZOBRAZENÍ VÝSLEDKU
  document.getElementById("triageForm").classList.add("hidden");

  const res = document.getElementById("result");
  res.classList.remove("hidden");

  let waitTime = {
    ESI1: "0 minut (okamžitě)",
    ESI2: "do 10 minut",
    ESI3: "do 30 minut",
    ESI4: "60–120 minut",
    ESI5: "dle vytíženosti (nízká priorita)",
  }[priority];

  res.innerHTML = `
    <h2>Údaje odeslány sestře</h2>
    <p>Byli jste zařazeni do fronty podle naléhavosti.</p>
    <p><b>Orientační priorita: ${priority}</b></p>
    <p><b>Odhad čekací doby:</b> ${waitTime}</p>
    ${
      priority === "ESI1"
        ? "<p style='color:red'><b>Vyčkejte prosím na personál.</b></p>"
        : ""
    }
    <hr>
  `;
});
