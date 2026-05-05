let customPlayers = [];

/* ===== PLAYER ===== */
class CustomAudioPlayer {
  constructor(playerElement) {
    this.playerElement = playerElement;

    const src = playerElement.dataset.src;

    this.audio = new Audio(src || "");

    this.playBtn = playerElement.querySelector('.play-pause-btn');
    this.muteBtn = playerElement.querySelector('.mute-btn');
    this.status = playerElement.querySelector('.status');

    this.audio.preload = "none";
    this.audio.volume = 0.8;

    this.init();
  }

  init() {
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.muteBtn.addEventListener('click', () => this.toggleMute());

    this.audio.addEventListener('play', () => {
      this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      this.status.textContent = "يتم التشغيل الآن";
    });

    this.audio.addEventListener('pause', () => {
      this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
      this.status.textContent = "متوقف";
    });

    this.audio.addEventListener('error', () => {
      this.status.textContent = "❌ الإذاعة غير متاحة";
      this.playerElement.style.opacity = "0.6";
    });
  }

  togglePlay() {
    customPlayers.forEach(p => {
      if (p !== this) p.audio.pause();
    });

    if (this.audio.paused) {
      this.audio.play().catch(() => {
        this.status.textContent = "تعذر التشغيل";
      });
    } else {
      this.audio.pause();
    }
  }

  toggleMute() {
    this.audio.muted = !this.audio.muted;

    this.muteBtn.innerHTML = this.audio.muted
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
  }
}

/* ===== INIT PLAYERS ===== */
function initPlayers() {
  customPlayers = [];

  document.querySelectorAll('.custom-audio-player').forEach(el => {
    customPlayers.push(new CustomAudioPlayer(el));
  });
}

/* ===== LOAD STATIONS (STABLE VERSION) ===== */
async function loadStations() {
  const grid = document.getElementById('allStationsGrid');
  if (!grid) return;

  try {
    grid.innerHTML = "<p>جاري تحميل الإذاعات...</p>";

    const res = await fetch('https://mp3quran.net/api/v3/radios');
    if (!res.ok) throw new Error("API Error");

    const data = await res.json();

    if (!data?.radios?.length) {
      grid.innerHTML = "<p>لا توجد بيانات</p>";
      return;
    }

    const fragment = document.createDocumentFragment();

    data.radios.forEach(station => {

      if (!station.url) return;

      const div = document.createElement('div');
      div.className = 'station-card';

      const title = document.createElement('h3');
      title.textContent = station.name;

      const player = document.createElement('div');
      player.className = 'custom-audio-player';
      player.dataset.src = station.url;

      player.innerHTML = `
        <button class="play-pause-btn"><i class="fas fa-play"></i></button>
        <div class="station-info">
          <span class="station-name">${station.name}</span>
          <span class="status">اضغط للتشغيل</span>
        </div>
        <button class="mute-btn"><i class="fas fa-volume-up"></i></button>
      `;

      div.appendChild(title);
      div.appendChild(player);

      fragment.appendChild(div);
    });

    grid.innerHTML = "";
    grid.appendChild(fragment);

    initPlayers();
    initSearch();

  } catch (err) {
    console.log(err);
    grid.innerHTML = "<p>تعذر تحميل الإذاعات</p>";
  }
}

/* ===== SEARCH ===== */
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  input.addEventListener('input', () => {
    const val = input.value.toLowerCase().trim();

    document.querySelectorAll('.station-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(val)
        ? ""
        : "none";
    });
  });
}

/* ===== MENU ===== */
function initMenu() {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');
  const overlay = document.querySelector('.overlay');

  if (!menuBtn || !nav || !overlay) return;

  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
  });

  overlay.addEventListener('click', () => {
    nav.classList.remove('active');
    overlay.classList.remove('active');
  });
}

/* ===== START ===== */
document.addEventListener('DOMContentLoaded', () => {
  initPlayers();
  initMenu();
  loadStations();
});