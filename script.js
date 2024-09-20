const weatherApiKey = 'f0740f5d01435496dce9002eab26d32d'; // Verifica que esta clave esté activa y válida

// Lista de ciudades, sus zonas horarias y el ID de OpenWeatherMap
const cities = [
    { name: 'Ciudad de México', id: 'ciudad-de-mexico', timezone: 'America/Mexico_City' },
    { name: 'Estado de Sonora', id: 'sonora', timezone: 'America/Hermosillo' },  // Sonora sigue el mismo horario todo el año, sin cambio de hora
    { name: 'Baja California', id: 'baja-california', timezone: 'America/Tijuana' }
];
// Puedes agregar más ciudades aquí

// Función para generar el HTML de cada ciudad dinámicamente
function generateCityCards() {
    const container = document.getElementById('cities-container');
    
    cities.forEach(city => {
        const cityCard = `
            <section class="city-card" id="${city.id}">
                <h2>${city.name}</h2>
                <p class="time" id="${city.id}-time">00:00:00</p>
                <p class="day" id="${city.id}-day">Día de la semana</p>
                <p class="date" id="${city.id}-date">Fecha completa</p>
                <img src="icons/default.png" alt="Icono del clima" class="weather-icon" id="${city.id}-icon">
                <p class="weather-description" id="${city.id}-weather-description">Clima</p>
                <p class="temperature">
                    <img src="icons/termometro.png" alt="Ícono de termómetro" class="thermometer-icon">
                    <span id="${city.id}-temperature">Temperatura</span>
                </p>
                <div class="ball-container">
            <div class="moving-ball"></div>
        </div>
            </section>
        `;
        container.innerHTML += cityCard;
    });
}

// Función para actualizar la hora, día y fecha
function updateClock(timezone, timeElementId, dayElementId, dateElementId) {
    const now = new Date();
    
    // Formato de la hora
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: timezone };
    const formattedTime = new Intl.DateTimeFormat([], timeOptions).format(now);
    
    // Formato para el día de la semana (solo el día)
    const dayOptions = { weekday: 'long', timeZone: timezone };
    const formattedDay = new Intl.DateTimeFormat([], dayOptions).format(now);
    
    // Formato para la fecha completa (día, mes, año)
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone };
    const formattedDate = new Intl.DateTimeFormat([], dateOptions).format(now);
    
    // Actualizar el contenido en el HTML
    document.getElementById(timeElementId).textContent = formattedTime;   // Actualiza la hora
    document.getElementById(dayElementId).textContent = formattedDay;     // Actualiza el día de la semana
    document.getElementById(dateElementId).textContent = formattedDate;   // Actualiza la fecha
}

// Función para actualizar el clima con manejo de errores mejorado
async function updateWeather(city, cityId) {
    const weatherDescriptionElement = document.getElementById(`${cityId}-weather-description`);
    const temperatureElement = document.getElementById(`${cityId}-temperature`);
    const weatherIconElement = document.getElementById(`${cityId}-icon`);

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric&lang=es`);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - No se pudo obtener el clima para ${city}`);
        }

        const data = await response.json();

        if (!data.weather || data.weather.length === 0) {
            throw new Error('No se encontraron datos del clima.');
        }

        // Clima y temperatura separados
        const weatherDescription = data.weather[0].description; // Descripción del clima
        const temperature = Math.round(data.main.temp); // Redondear la temperatura

        // Actualizar los elementos
        weatherDescriptionElement.textContent = weatherDescription; // Clima
        temperatureElement.textContent = `${temperature}°C`; // Temperatura

        const icon = data.weather[0].icon;
        weatherIconElement.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    } catch (error) {
        console.error('Error al obtener el clima:', error);
        weatherDescriptionElement.textContent = 'Error al obtener el clima';
        temperatureElement.textContent = '';
    }
}


// Función para inicializar los relojes y clima de todas las ciudades
function initializeClocksAndWeather() {
    cities.forEach(city => {
        setInterval(() => updateClock(city.timezone, `${city.id}-time`, `${city.id}-day`, `${city.id}-date`), 1000);
        updateWeather(city.name, city.id);
    });
    
}

// Inicializa la página de noticias
generateCityCards();
initializeClocksAndWeather();

const newsApiKey = 'pub_52995d70eb1ae2c60b78f58d62cc6de8e4ed6'; // Clave API de NewsData.io
const newsRegion = 'mx'; // Región para las noticias (cambiar si es necesario)

async function updateNewsBanner() {
    const newsContent = document.querySelector('.news-content p'); // Selecciona el párrafo del banner

    if (!newsContent) {
        console.error('No se encontró el elemento del banner de noticias.');
        return;
    }

    try {
        const response = await fetch(`https://newsdata.io/api/1/news?apikey=${newsApiKey}&country=${newsRegion}`);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - No se pudieron obtener las noticias`);
        }

        const data = await response.json();

        // Verifica si el API devolvió resultados
        if (!data.results || data.results.length === 0) {
            throw new Error('No se encontraron noticias.');
        }

        // Extrae los titulares de las noticias
        const headlines = data.results.map(article => article.title);

        // Concatenar los titulares en un solo string separado por " | "
        const newsString = headlines.join(' | ');

        // Duplicar el string de noticias para que se repita infinitamente
        newsContent.textContent = `Noticias: ${newsString} | ${newsString}`; // Duplica el contenido

        // Ajusta la duración de la animación en función del contenido
        const contentWidth = newsContent.scrollWidth;
        const containerWidth = document.querySelector('.news-banner').offsetWidth;

        // Calcular la duración de la animación basada en el ancho del contenido
        const animationDuration = (contentWidth / containerWidth) * 15; // Escala la duración a una velocidad razonable

        // Aplicar la nueva duración de animación
        document.querySelector('.news-content p').style.animationDuration = `${animationDuration}s`;

    } catch (error) {
        console.error('Error al obtener las noticias:', error);
        newsContent.textContent = 'Error al obtener las noticias';
    }
}

// Ejecutar la función al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateNewsBanner();
    setInterval(updateNewsBanner, 10 * 60 * 1000); // Actualizar cada 10 minutos
});


const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
const icon = document.getElementById('theme-icon');

toggleButton.addEventListener('click', () => {
  body.classList.toggle('dark-mode');

  // Cambiar el ícono entre sol y luna
  if (body.classList.contains('dark-mode')) {
    icon.src = "icons/sun-icon.png"; // Cambia la imagen a sol
    icon.alt = "Light Mode";   // Cambia el texto alternativo
  } else {
    icon.src = "icons/moon-icon.png"; // Cambia la imagen a luna
    icon.alt = "Dark Mode";     // Cambia el texto alternativo
  }
});


document.addEventListener('DOMContentLoaded', (event) => {
    const rainSound = document.getElementById('rain-sound');
    const playButton = document.getElementById('play-sound');

    // Manejar el evento de clic en el botón
    playButton.addEventListener('click', () => {
        // Verificar si el sonido está en pausa, y reproducirlo
        if (rainSound.paused) {
            rainSound.play();
            playButton.textContent = 'Pausar sonido de lluvia'; // Cambiar el texto del botón
        } else {
            rainSound.pause();
            playButton.textContent = 'Reproducir sonido de lluvia'; // Cambiar el texto del botón
        }
    });

    // Verificar si el audio se puede reproducir completamente
    rainSound.addEventListener('canplaythrough', () => {
        console.log('El audio está listo para reproducirse.');
    });

    // Manejar errores de carga del archivo de audio
    rainSound.addEventListener('error', (e) => {
        console.error('Error al cargar el archivo de audio:', e);
    });
});