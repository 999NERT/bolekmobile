// === YOUTUBE MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ"; 
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;
  
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  if(err) err.style.display = "none";
  if(btn) btn.style.display = "none";
  if(img) img.style.display = "none";
  if(loader) loader.style.display = "flex";

  try {
    const res = await fetch(proxy);
    const data = await res.json();
    const xml = new DOMParser().parseFromString(data.contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów");

    let videoEntry = [...entries].find(e => !e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")) || entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();

    if(btn) btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    if(img){
      img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      img.onload = () => {
        img.style.display = "block";
        if(btn) btn.style.display = "block";
        if(loader) loader.style.display = "none";
      };
      img.onerror = () => {
        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        img.style.display = "block";
        if(btn) btn.style.display = "block";
        if(loader) loader.style.display = "none";
      };
    }

  } catch (e) {
    console.error("Błąd wczytywania YT:", e);
    if(loader) loader.style.display = "none";
    if(err) err.style.display = "block";
  }
}

// === STREAM STATUS ===
async function checkStreamStatus() {
  const twitch = document.getElementById("twitchLivePanel");
  const kick = document.getElementById("kickLivePanel");
  const discord = document.querySelector(".discord-btn .live-text");

  // Twitch
  try {
    const res = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const text = await res.text();
    if(twitch){
      const textEl = twitch.querySelector(".live-text");
      if(text.toLowerCase().includes("offline")){
        textEl.textContent = "OFFLINE";
        textEl.classList.remove("live");
      } else {
        textEl.textContent = "LIVE";
        textEl.classList.add("live");
      }
    }
  } catch (e) { console.log("Błąd Twitch API:", e); }

  // Kick
  try {
    const res = await fetch("https://kick.com/api/v2/channels/angelkacs");
    if(res.ok){
      const data = await res.json();
      if(kick){
        const textEl = kick.querySelector(".live-text");
        if(data.livestream?.is_live){
          textEl.textContent = "LIVE";
          textEl.classList.add("live");
        } else {
          textEl.textContent = "OFFLINE";
          textEl.classList.remove("live");
        }
      }
    }
  } catch(e){ console.log("Błąd Kick API:", e); }

  // Discord
  if(discord){
    discord.textContent = "JOIN";
    discord.classList.add("join"); // kolor można ustawić w CSS
  }
}

// === BLOKADA PRAWEGO PRZYCISKU I SKRÓTÓW ===
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

document.addEventListener('keydown', function(e) {
  // Ctrl+U
  if(e.ctrlKey && e.key.toLowerCase() === 'u'){
    e.preventDefault();
    alert("Wyświetlanie źródła strony jest zablokowane!");
  }
  // F12
  if(e.key === "F12"){
    e.preventDefault();
    alert("Otwieranie DevTools jest zablokowane!");
  }
  // Ctrl+Shift+I
  if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i'){
    e.preventDefault();
    alert("Otwieranie DevTools jest zablokowane!");
  }
});

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});
