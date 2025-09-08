// === YOUTUBE MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ"; 
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;
  
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  // Reset stanu
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

    // pomiń shortsy, weź najnowszy normalny film
    let videoEntry = [...entries].find(e => 
      !e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")
    ) || entries[0];

    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();

    if(btn) btn.href = `https://www.youtube.com/watch?v=${videoId}`;

    // najpierw sprawdzamy czy maxres istnieje
    const testImg = new Image();
    testImg.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    testImg.onload = () => {
      img.src = testImg.src;
      img.style.display = "block";
      if(btn) btn.style.display = "block";
      if(loader) loader.style.display = "none";
    };

    testImg.onerror = () => {
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      img.style.display = "block";
      if(btn) btn.style.display = "block";
      if(loader) loader.style.display = "none";
    };

  } catch (e) {
    console.error("Błąd wczytywania YT:", e);
    if(loader) loader.style.display = "none";
    if(err) err.style.display = "block";
  }
}

// === STREAM LIVE STATUS === (zostaje bez zmian)
async function checkStreamStatus() {
  const twitch = document.getElementById("twitchLivePanel");
  const kick = document.getElementById("kickLivePanel");

  try {
    const res = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const text = await res.text();
    if (text.includes("offline")) {
      twitch?.classList.remove("live");
      twitch?.querySelector(".live-text").textContent = "OFFLINE";
    } else {
      twitch?.classList.add("live");
      twitch?.querySelector(".live-text").textContent = "LIVE";
    }
  } catch (e) { console.log("Twitch API error:", e); }

  try {
    const res = await fetch("https://kick.com/api/v2/channels/angelkacs");
    if (res.ok) {
      const data = await res.json();
      if (data.livestream?.is_live) {
        kick?.classList.add("live");
        kick?.querySelector(".live-text").textContent = "LIVE";
      } else {
        kick?.classList.remove("live");
        kick?.querySelector(".live-text").textContent = "OFFLINE";
      }
    }
  } catch (e) { console.log("Kick API error:", e); }
}

// === START ===
document.addEventListener("DOMContentLoaded", () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});
