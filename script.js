document.getElementById("triageForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = new FormData(this);
  const data = Object.fromEntries(form.entries());

  // Všechny zaškrtnuté checkboxy
  const checked = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map((c) => c.name);

  // Intenzita bolesti
  const bolest = Number(data.bolest_intenzita);

  // Výchozí priorita
  let priority = "ESI5";

  // ESI 1
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

  // ESI 2
  const ESI2 = ["c_tep", "uraz_krvaceni", "uraz_zlomenina"];

  if (priority === "ESI5" || priority === "ESI4" || priority === "ESI3") {
    if (
      data.b_dychani === "vyrazne" ||
      bolest >= 7 ||
      checked.some((c) => ESI2.includes(c)) ||
      data.dusnost === "těžká"
    ) {
      priority = "ESI2";
    }
  }

  // ESI 3
  if (priority === "ESI5" || priority === "ESI4") {
    if (bolest >= 4 || data.dusnost === "střední") {
      priority = "ESI3";
    }
  }

  // ESI 4
  if (priority === "ESI5") {
    if (bolest >= 1) {
      priority = "ESI4";
    }
  }

  // ULOŽENÍ (demo verze → localStorage)
  const record = {
    time: new Date().toISOString(),

    identifikace: {
      jmeno: data.jmeno,
      prijmeni: data.prijmeni,
      narozeni: data.narozeni,
      telefon: data.telefon,
    },

    checked,
    bolest: data.bolest_intenzita,
    dusnost: data.dusnost,
    priorita: priority,
  };

  const all = JSON.parse(localStorage.getItem("triageDemo") || "[]");
  all.push(record);
  localStorage.setItem("triageDemo", JSON.stringify(all, null, 2));

  // Zobrazení výsledku
  document.getElementById("triageForm").classList.add("hidden");

  const res = document.getElementById("result");
  res.classList.remove("hidden");

  const waitTimes = {
    ESI1: "0 minut (okamžitě)",
    ESI2: "do 10 minut",
    ESI3: "do 30 minut",
    ESI4: "60–120 minut",
    ESI5: "dle vytíženosti",
  };

  res.innerHTML = `
    <h2>Údaje byly odeslány sestře</h2>
    <p>Přidělená priorita: <b>${priority}</b></p>
    <p>Odhad čekací doby: <b>${waitTimes[priority]}</b></p>
    ${
      priority === "ESI1"
        ? "<p style='color:red'><b>Vyčkejte prosím na personál.</b></p>"
        : ""
    }
    <hr>
  `;
});
