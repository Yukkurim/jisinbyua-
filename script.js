const quakeList = document.getElementById("quakeList");
const alertSound = document.getElementById("alertSound");
const downloadBtn = document.getElementById("downloadBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const refreshIntervalInput = document.getElementById("refreshInterval");
const enableSound = document.getElementById("enableSound");

let quakeHistory = [];
let lastFetch = "";

async function fetchQuakes() {
  const res = await fetch("https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml");
  const text = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");
  const items = Array.from(xml.querySelectorAll("item")).slice(0, 50);

  items.forEach(item => {
    const title = item.querySelector("title").textContent;
    const link = item.querySelector("link").textContent;
    const date = item.querySelector("pubDate").textContent;

    if (!quakeHistory.find(q => q.link === link)) {
      quakeHistory.unshift({ title, link, date });
      if (quakeHistory.length > 50) quakeHistory.pop();

      if (enableSound.checked) alertSound.play();
    }
  });

  renderQuakeList();
}

function renderQuakeList() {
  quakeList.innerHTML = "";
  quakeHistory.forEach(q => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = \`
      <h3>\${q.title}</h3>
      <p><strong>発生日時:</strong> \${q.date}</p>
      <button onclick="window.open('\${q.link}', '_blank')">詳しく見る</button>
    \`;
    quakeList.appendChild(div);
  });
}

function downloadHistory() {
  const content = quakeHistory.map(q => \`\${q.date} - \${q.title} - \${q.link}\`).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "quake-history.txt";
  a.click();
}

downloadBtn.onclick = downloadHistory;
settingsBtn.onclick = () => settingsModal.classList.remove("hidden");
closeSettings.onclick = () => settingsModal.classList.add("hidden");

function startFetching() {
  fetchQuakes();
  setInterval(fetchQuakes, parseInt(refreshIntervalInput.value) * 1000);
}

window.onload = startFetching;