
// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('resultsContainer');
const messageContainer = document.getElementById('messageContainer');
const loadingSpinner = document.getElementById('loadingSpinner');


searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Función para manejar la búsqueda
function handleSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm === '') {
        showMessage('Por favor ingresa un nombre para buscar', 'error');
        return;
    }
    
    showLoading(true);
    resultsContainer.innerHTML = '';
    
    searchCharacters(searchTerm)
        .then(characters => {
            if (characters.length === 0) {
                showMessage('No se encontraron personajes con ese nombre', 'info');
            } else {
                renderCharacters(characters);
            }
        })
        .catch(error => {
            showMessage('Error al buscar personajes: ' + error.message, 'error');
        })
        .finally(() => {
            showLoading(false);
        });
}

// Función para buscar personajes en la API
async function searchCharacters(name) {
    const response = await fetch(`https://dragonball-api.com/api/characters?name=${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('Error en la petición');
    const data = await response.json();
    return data.items || [];
}

// Función para renderizar personajes
function renderCharacters(characters) {
    characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.className = 'col-md-4 col-lg-3 mb-4';
        characterCard.innerHTML = `
            <div class="card character-card">
                <img src="${character.image || 'https://via.placeholder.com/300'}" 
                     class="card-img-top character-img" 
                     alt="${character.name}">
                <div class="card-body">
                    <h5 class="card-title">${character.name}</h5>
                    <p class="card-text">
                        <strong>Raza:</strong> ${character.race || 'Desconocida'}<br>
                        <strong>Género:</strong> ${character.gender || 'Desconocido'}
                    </p>
                </div>
            </div>
        `;
        resultsContainer.appendChild(characterCard);
    });
}

// Función para mostrar mensajes
function showMessage(text, type) {
    messageContainer.innerHTML = `<div class="${type}-message">${text}</div>`;
}

// Función para mostrar/ocultar spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
    }
}