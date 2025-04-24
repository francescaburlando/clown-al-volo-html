document.addEventListener("DOMContentLoaded", () => {
  const nome = localStorage.getItem("nome");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!nome) window.location.href = "index.html";
  document.getElementById("saluto").innerText = `Ciao ${nome}!`;
  if (isAdmin) document.getElementById("admin-area").style.display = "block";
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
  snap.forEach(doc => {
    const e = doc.data();
    const div = document.createElement("div");
    div.className = "evento";
    div.innerHTML = `
      <h3>${e.titolo}</h3>
      <p><strong>Luogo:</strong> ${e.luogo}</p>
      <p><strong>Data:</strong> ${new Date(e.data).toLocaleString()}</p>
      <p><strong>Partecipanti:</strong> ${e.partecipanti.join(", ")}</p>
      ${!e.partecipanti.includes(localStorage.getItem("nome")) ?
        `<button onclick="partecipa('${doc.id}', ${JSON.stringify(e.partecipanti)})">Partecipa</button>` : ""}
      ${localStorage.getItem("isAdmin") === "true" ? `
        <button onclick="eliminaEvento('${doc.id}')">🗑️</button>
      ` : ""}
    `;
    lista.appendChild(div);
  });
}

async function partecipa(id, attuali) {
  attuali.push(localStorage.getItem("nome"));
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
  const data = prompt("Data?");
  if (titolo && luogo && data) {
    await db.collection("eventi").add({ titolo, luogo, data, partecipanti: [] });
    caricaEventi();
  }
}
