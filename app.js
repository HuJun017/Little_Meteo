const input       = document.querySelector('.input_text');
const country     = document.querySelector('.country_text');
const button      = document.querySelector('.submit');
const results     = document.querySelector('#results');
const mapControls = document.getElementById('map-controls');
const citySelect  = document.getElementById('city-select');

const API_KEY = '50a7aa80fa492fa92e874d23ad061374';

let map     = null;
let markers = [];

// ── Map init ──────────────────────────────────────────────────────────────────
function initMap() {
  if (map) return;
  map = L.map('map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
}

function updateMap(cities) {
  initMap();

  markers.forEach(m => m.remove());
  markers = [];

  cities.forEach(({ weather, lat, lon }) => {
    const marker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`
        <strong>${weather.name}, ${weather.sys.country}</strong><br>
        ${weather.weather[0].description}<br>
        🌡 ${weather.main.temp} °C
      `);
    markers.push(marker);
  });

  if (cities.length === 1) {
    map.setView([cities[0].lat, cities[0].lon], 10);
    markers[0].openPopup();
  } else {
    map.fitBounds(L.featureGroup(markers).getBounds().pad(0.3));
  }

  // Dropdown
  if (cities.length > 1) {
    citySelect.innerHTML = cities.map((c, i) =>
      `<option value="${i}">${c.weather.name}, ${c.weather.sys.country} (${c.lat.toFixed(2)}, ${c.lon.toFixed(2)})</option>`
    ).join('');
    mapControls.style.display = 'block';

    citySelect.onchange = () => {
      const i = parseInt(citySelect.value);
      map.flyTo([cities[i].lat, cities[i].lon], 10, { duration: 1.2 });
      markers[i].openPopup();
    };
  } else {
    mapControls.style.display = 'none';
  }
}

// ── Search ────────────────────────────────────────────────────────────────────
button.addEventListener('click', async () => {
  const city        = input.value.trim();
  const countryCode = country.value.trim();
  if (!city) return;

  results.innerHTML = '<div class="d-flex justify-content-center mt-4"><div class="spinner-border text-primary" role="status"></div></div>';

  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}${countryCode ? ',' + countryCode : ''}&limit=5&appid=${API_KEY}`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error();
    const locations = await geoRes.json();

    const filtered = locations.filter(loc => loc.local_names && Object.keys(loc.local_names).length > 3);

    if (filtered.length === 0) {
      results.innerHTML = '<p class="text-danger text-center">Nessuna città trovata.</p>';
      return;
    }

    const weatherList = await Promise.all(
      filtered.map(loc =>
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${API_KEY}&units=metric`)
          .then(r => r.json())
      )
    );

    const cities = filtered.map((loc, i) => ({ lat: loc.lat, lon: loc.lon, weather: weatherList[i] }));

    // Prima ricerca: sposta il form nel left-col e rivela il layout a due colonne
    if (!document.body.classList.contains('searched')) {
      const searchForm  = document.getElementById('search-form');
      const leftCol     = document.getElementById('left-col');
      const searchCenter = document.getElementById('search-center');
      const mainRow     = document.getElementById('main-row');

      leftCol.insertBefore(searchForm, leftCol.firstChild);
      searchCenter.classList.add('search-center-out');
      searchCenter.addEventListener('animationend', () => searchCenter.classList.add('d-none'), { once: true });

      mainRow.classList.remove('d-none');
      mainRow.classList.add('main-row-in');
      document.body.classList.add('searched');
    }

    results.innerHTML = '';
    cities.forEach(({ weather }, i) => {
      const card = createCard(weather, i, cities);
      results.appendChild(card);
      setTimeout(() => card.classList.add('card-visible'), i * 100);
    });

    updateMap(cities);

    input.value   = '';
    country.value = '';
  } catch {
    results.innerHTML = '<p class="text-danger text-center">Errore: città non trovata.</p>';
  }
});

// ── Card ──────────────────────────────────────────────────────────────────────
function createCard(data, index, cities) {
  const mid  = ((data.main.temp_max + data.main.temp_min) / 2).toFixed(1);
  const card = document.createElement('div');
  card.className = 'card mb-3 weather-card';
  card.innerHTML = `
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" width="32" style="vertical-align:middle">
        ${data.name}, ${data.sys.country}
      </h5>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-info btn-map" title="Mostra sulla mappa">🗺</button>
        <button class="btn btn-sm btn-outline-secondary btn-toggle">▲ Nascondi</button>
        <button class="btn btn-sm btn-outline-danger btn-close-card">✕</button>
      </div>
    </div>
    <div class="card-body text-center card-content">
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="weather-icon">
      <p class="mb-1"><strong>Descrizione:</strong> ${data.weather[0].description}</p>
      <div class="row mt-2">
        <div class="col-6"><span class="badge bg-danger w-100 py-2">Max ${data.main.temp_max} °C</span></div>
        <div class="col-6"><span class="badge bg-primary w-100 py-2">Min ${data.main.temp_min} °C</span></div>
      </div>
      <div class="row mt-2">
        <div class="col-4"><span class="badge bg-secondary w-100 py-2">Temp ${data.main.temp} °C</span></div>
        <div class="col-4"><span class="badge bg-secondary w-100 py-2">Media ${mid} °C</span></div>
        <div class="col-4"><span class="badge bg-secondary w-100 py-2">Umidità ${data.main.humidity}%</span></div>
      </div>
      <div class="mt-2">
        <span class="badge bg-info text-dark py-2">💨 Vento ${data.wind.speed} km/h</span>
      </div>
    </div>
  `;

  const body      = card.querySelector('.card-content');
  const toggleBtn = card.querySelector('.btn-toggle');

  toggleBtn.addEventListener('click', () => {
    const isOpen = !body.classList.contains('collapsed');
    body.classList.toggle('collapsed', isOpen);
    toggleBtn.textContent = isOpen ? '▼ Mostra' : '▲ Nascondi';
  });

  card.querySelector('.btn-map').addEventListener('click', () => {
    initMap();
    const { lat, lon } = cities[index];
    map.flyTo([lat, lon], 10, { duration: 1.2 });
    markers[index]?.openPopup();
    if (cities.length > 1) citySelect.value = index;
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  card.querySelector('.btn-close-card').addEventListener('click', () => {
    card.classList.add('card-hiding');
    card.addEventListener('animationend', () => card.remove());
  });

  return card;
}
