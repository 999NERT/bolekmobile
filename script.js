// === YOUTUBE MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ"; 
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;
  
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  // Reset stanu używając klas
  if(err) err.classList.add('hidden');
  if(btn) btn.classList.add('hidden');
  if(img) img.classList.add('hidden');
  if(loader) loader.classList.remove('hidden');

  try {
    const res = await fetch(proxy);
    const data = await res.json();
    const xml = new DOMParser().parseFromString(data.contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów");

    let videoEntry = [...entries].find(e => !e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")) || entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();

    if(btn) {
      btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    if(img){
      img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      img.onload = () => {
        img.classList.remove('hidden');
        btn.classList.remove('hidden');
        loader.classList.add('hidden');
      };
      img.onerror = () => {
        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        img.classList.remove('hidden');
        btn.classList.remove('hidden');
        loader.classList.add('hidden');
      };
    }

  } catch (e) {
    console.error("Błąd wczytywania YT:", e);
    loader.classList.add('hidden');
    err.classList.remove('hidden');
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
    discord.classList.add("join");
  }
}

// === OBSŁUGA OPISÓW PRZYCISKÓW MOBILE ===
function initButtonDescriptions() {
  const buttons = document.querySelectorAll('.mobile-button');
  
  buttons.forEach(button => {
    let clickCount = 0;
    
    button.addEventListener('click', function(e) {
      clickCount++;
      
      if (clickCount === 1) {
        // Pierwsze kliknięcie - pokaż opis
        e.preventDefault();
        
        // Ukryj wszystkie inne opisy
        buttons.forEach(otherBtn => {
          if (otherBtn !== this) {
            otherBtn.classList.remove('show-description');
            const originalText = otherBtn.getAttribute('data-original-text');
            if (originalText) {
              otherBtn.querySelector('.button-text').innerHTML = originalText;
            }
          }
        });
        
        // Pokaż opis dla tego przycisku
        if (!this.classList.contains('show-description')) {
          const originalText = this.querySelector('.button-text').innerHTML;
          this.setAttribute('data-original-text', originalText);
          this.querySelector('.button-text').innerHTML = this.getAttribute('data-description');
          this.classList.add('show-description');
        }
        
        // Zresetuj licznik po 1 sekundzie
        setTimeout(() => {
          clickCount = 0;
        }, 1000);
        
      } else if (clickCount === 2) {
        // Drugie kliknięcie - przejdź do linku
        this.classList.remove('show-description');
        const originalText = this.getAttribute('data-original-text');
        if (originalText) {
          this.querySelector('.button-text').innerHTML = originalText;
        }
        // Pozwól na normalne przejście do linku
        clickCount = 0;
      }
    });
  });
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
  initButtonDescriptions();
  setInterval(checkStreamStatus, 60000);
});
