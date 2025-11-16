document.getElementById("triageForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(this).entries());
  const checked = Array.from(
    this.querySelectorAll("input[type=checkbox]:checked")
  ).map((i) => i.name);
  data.checked = checked;

  // --- Jednoduché vyhodnocení triáže ---
  let priority = "T5";
  if (
    checked.some((c) =>
      [
        "dychani",
        "bolest_hrudi",
        "vedomi",
        "krvaceni",
        "mrtvice",
        "alergie",
      ].includes(c)
    )
  ) {
    priority = "T1";
  } else if (
    checked.some((c) =>
      ["dusnost_stredni", "uraz_hlava", "horecka", "tep"].includes(c)
    ) ||
    Number(data.bolest_skala) >= 7
  ) {
    priority = "T2";
  } else if (Number(data.bolest_skala) >= 4) {
    priority = "T3";
  } else if (Number(data.bolest_skala) >= 1) {
    priority = "T4";
  }

  const result = {
    time: new Date().toISOString(),
    popis: data.popis,
    bolest: data.bolest_skala,
    symptomy: checked,
    priorita: priority,
  };

  // --- Uložení do LocalStorage (simulace uloženého JSON) ---
  const all = JSON.parse(localStorage.getItem("triageSubmissions") || "[]");
  all.push(result);
  localStorage.setItem("triageSubmissions", JSON.stringify(all, null, 2));

  // --- Zobrazení výsledku ---
  document.getElementById("triageForm").classList.add("hidden");
  const resDiv = document.getElementById("result");
  resDiv.classList.remove("hidden");
  resDiv.innerHTML = `
    <h2>Data odeslána ✅</h2>
    <p>Vaše odpovědi byly odeslány sestře. Byli jste zařazeni do fronty.</p>
    <p><b>Orientační priorita: ${priority}</b></p>
    ${
      priority === "T1"
        ? "<p><b>Okamžitý zásah – zůstaňte na místě!</b></p>"
        : ""
    }
    <p><small>(Toto je demo – data jsou uložena pouze ve vašem prohlížeči.)</small></p>
  `;
});
