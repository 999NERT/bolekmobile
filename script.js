const buttons = document.querySelectorAll('.mobile-button');
let activeButton = null;

buttons.forEach(btn => {
  const textSpan = btn.querySelector('.button-text');
  const originalHTML = textSpan.innerHTML;
  const description = btn.dataset.description;
  const url = btn.getAttribute('href'); // <-- MUSI być pobrane tutaj!
  const badge = btn.closest('.button-with-popup').querySelector('.age-badge-mobile, .event-badge-mobile');

  btn.addEventListener('click', e => {
    e.preventDefault();

    // Drugi klik -> przejście
    if (activeButton === btn && btn.classList.contains('show-description')) {
      window.location.href = url; // działa na mobile
      return;
    }

    // Inny przycisk był aktywny -> przywróć
    if (activeButton && activeButton !== btn) {
      const prevSpan = activeButton.querySelector('.button-text');
      prevSpan.innerHTML = activeButton.dataset.originalText;
      activeButton.classList.remove('show-description');

      const prevBadge = activeButton.closest('.button-with-popup').querySelector('.age-badge-mobile, .event-badge-mobile');
      if (prevBadge) prevBadge.style.display = 'block';

      activeButton = null;
    }

    // Pierwszy klik -> opis
    if (!btn.classList.contains('show-description')) {
      btn.dataset.originalText = originalHTML;
      textSpan.innerHTML = `
        ${description}
        <br><span class="click-hint">Kliknij ponownie, aby przejść na stronę</span>
      `;
      btn.classList.add('show-description');
      if (badge) badge.style.display = 'none';
      activeButton = btn;
    }
  });
});


// === YT MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ";
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");

  try {
    const res = await fetch(proxy);
    const { contents } = await res.json();
    const xml = new DOMParser().parseFromString(contents,"application/xml");
    const entries = xml.getElementsByTagName("entry");
    if (!entries.length) throw new Error("Brak filmów");

    let videoEntry = [...entries].find(e => !e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")) || entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();
    if (btn) btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    if (img) {
      img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      img.onload = () => btn?.classList.add("visible");
      img.onerror = () => img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  } catch(e) {
    console.error(e);
    if (err) err.hidden = false;
  }
}

// === STREAM LIVE STATUS ===
async function checkStreamStatus() {
  const twitch = document.getElementById("twitchLivePanel");
  const kick = document.getElementById("kickLivePanel");

  // Twitch
  try {
    const res = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const text = await res.text();
    if (text.includes("offline")) {
      twitch?.classList.remove("live");
      twitch?.querySelector(".live-text") && (twitch.querySelector(".live-text").textContent = "OFFLINE");
    } else {
      twitch?.classList.add("live");
      twitch?.querySelector(".live-text") && (twitch.querySelector(".live-text").textContent = "LIVE");
    }
  } catch (e) { console.log("Twitch API error:", e); }

  // Kick
  try {
    const res = await fetch("https://kick.com/api/v2/channels/angelkacs");
    if (res.ok) {
      const data = await res.json();
      if (data.livestream?.is_live) {
        kick?.classList.add("live");
        kick?.querySelector(".live-text") && (kick.querySelector(".live-text").textContent = "LIVE");
      } else {
        kick?.classList.remove("live");
        kick?.querySelector(".live-text") && (kick.querySelector(".live-text").textContent = "OFFLINE");
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

const ytImage = new Image();
ytImage.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
ytImage.onload = () => {
  img.src = ytImage.src;  // dopiero teraz ustawiamy src w <img>
  img.classList.add('visible');
};
ytImage.onerror = () => {
  img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  img.classList.add('visible');
};
