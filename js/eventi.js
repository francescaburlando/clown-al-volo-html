document.addEventListener("DOMContentLoaded", () => {
  const nome = localStorage.getItem("nome");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!nome) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("saluto").innerText = `Ciao ${nome}!`;

  if (isAdmin) {
    document.getElementById("admin-area").style.display = "block";
  }

  caricaEventi();
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

async function caricaEventi() {
  const lista = document.getElementById("lista-eventi");
  lista.innerHTML = "";

  const snap = await db.collection("eventi").get();

  const oggi = new Date();
  const dataOggi = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate());

  const eventi = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(e => {
      const dataEvento = toJSDate(e.data);

      if (!dataEvento || isNaN(dataEvento)) return false;

      const dataSolo = new Date(dataEvento.getFullYear(), dataEvento.getMonth(), dataEvento.getDate());
      return dataSolo >= dataOggi;
    })
    .sort((a, b) => {
      const d1 = toJSDate(a.data);
      const d2 = toJSDate(b.data);
      return d1 - d2;
    });

  eventi.forEach(e => {
    const div = document.createElement("div");
    div.className = "evento";
    div.innerHTML = `
      <h3>${e.titolo}</h3>
      <p><strong>LUOGO:</strong> ${e.luogo}</p>
      <p><strong>DATA:</strong> ${formattaData(e.data)}</p>
      <p><strong>ORA:</strong> ${formattaOra(e.data)}</p>
      <p><strong>Partecipanti:</strong> ${e.partecipanti.join(", ")}</p>
      ${!e.partecipanti.includes(localStorage.getItem("nome")) ?
        `<button onclick="partecipa('${e.id}', ${JSON.stringify(e.partecipanti)})">Partecipa</button>` : ""}
      ${localStorage.getItem("isAdmin") === "true" ?
        `<button onclick="eliminaEvento('${e.id}')">🗑️ Elimina</button>` : ""}
    `;
    lista.appendChild(div);
  });
}

async function partecipa(id, attuali) {
  const nome = localStorage.getItem("nome");
  if (attuali.includes(nome)) {
    alert("Sei già registrato a questo evento!");
    return;
  }
  attuali.push(nome);
  await db.collection("eventi").doc(id).update({ partecipanti: attuali });
  caricaEventi();
}

async function eliminaEvento(id) {
  await db.collection("eventi").doc(id).delete();
  caricaEventi();
}

async function aggiungiEvento() {
  const titolo = prompt("Titolo?");
  const luogo = prompt("Luogo?");
  const data = prompt("Data? (es: 2025-04-26T15:30)");
  if (titolo && luogo && data) {
    await db.collection("eventi").add({ titolo, luogo, data, partecipanti: [] });
    caricaEventi();
  }
}

function toJSDate(d) {
  try {
    if (!d) return null;
    if (typeof d === "string") return new Date(d);
    if (typeof d.toDate === "function") return d.toDate(); // Timestamp Firebase compat
    return new Date(d);
  } catch {
    return null;
  }
}

function formattaData(d) {
  const date = toJSDate(d);
  if (!date || isNaN(date)) return "";

  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  return `${giorni[date.getDay()]} ${date.getDate()} ${mesi[date.getMonth()]} ${date.getFullYear()}`;
}

function formattaOra(d) {
  const date = toJSDate(d);
  if (!date || isNaN(date)) return "";

  const ore = String(date.getHours()).padStart(2, '0');
  const minuti = String(date.getMinutes()).padStart(2, '0');
  return `${ore}:${minuti}`;
}
