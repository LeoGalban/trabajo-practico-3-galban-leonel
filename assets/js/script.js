// Variables globales
let characters = []; // Almacena todos los personajes
let currentPage = 1; // Para controlar la paginación
let isLoading = false; // Para evitar múltiples llamadas durante el scroll
let isSearching = false; // Para saber si estamos en modo búsqueda

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('resultsContainer');
const messageContainer = document.getElementById('messageContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Carga inicial de personajes
    loadCharacters();
    
    // Evento para el botón de búsqueda
    searchButton.addEventListener('click', handleSearch);
    
    // Evento para la tecla Enter en el input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Evento para el scroll infinito
    window.addEventListener('scroll', handleInfiniteScroll);
});

/**
 * Maneja la búsqueda de personajes
 */
function handleSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm === '') {
        showMessage('Por favor ingresa un nombre para buscar', 'error');
        return;
    }
    
    isSearching = true;
    currentPage = 1;
    resultsContainer.innerHTML = '';
    showLoading(true);
    
    searchCharacters(searchTerm)
        .then(data => {
            if (data.length === 0) {
                showMessage('No se encontraron personajes con ese nombre', 'info');
            } else {
                characters = data;
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

/**
 * Carga personajes de la API con paginación
 */
async function loadCharacters() {
    if (isLoading) return;
    
    showLoading(true);
    isLoading = true;
    
    try {
        const data = await fetchCharacters(currentPage);
        if (data.length === 0 && currentPage === 1) {
            showMessage('No se encontraron personajes', 'info');
        } else if (data.length > 0) {
            characters = [...characters, ...data];
            renderCharacters(characters);
            currentPage++;
        }
    } catch (error) {
        showMessage('Error al cargar personajes: ' + error.message, 'error');
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

/**
 * Maneja el scroll infinito
 */
function handleInfiniteScroll() {
    // Si estamos en modo búsqueda, no cargamos más personajes
    if (isSearching) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    // Si estamos cerca del final de la página (100px antes del final)
    if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
        loadCharacters();
    }
}

/**
 * Obtiene personajes de la API
 * @param {number} page - Página a cargar
 * @returns {Promise<Array>} - Lista de personajes
 */
async function fetchCharacters(page = 1) {
    try {
        const response = await fetch(`https://dragonball-api.com/api/characters?page=${page}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching characters:', error);
        throw error;
    }
}

/**
 * Busca personajes por nombre
 * @param {string} name - Nombre a buscar
 * @returns {Promise<Array>} - Lista de personajes encontrados
 */
async function searchCharacters(name) {
    try {
        const response = await fetch(`https://dragonball-api.com/api/characters?name=${encodeURIComponent(name)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error searching characters:', error);
        throw error;
    }
}

/**
 * Renderiza los personajes en el DOM
 * @param {Array} characters - Lista de personajes a renderizar
 */
function renderCharacters(characters) {
    // Limpiar mensajes si hay resultados
    if (characters.length > 0) {
        messageContainer.innerHTML = '';
    }
    
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

/**
 * Muestra un mensaje en la interfaz
 * @param {string} text - Texto del mensaje
 * @param {string} type - Tipo de mensaje (error, info)
 */
function showMessage(text, type) {
    messageContainer.innerHTML = `
        <div class="${type}-message">${text}</div>
    `;
}

/**
 * Muestra u oculta el spinner de carga
 * @param {boolean} show - Mostrar u ocultar
 */
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
    }
}