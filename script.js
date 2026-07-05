const STORAGE_KEY = 'karate-diary-entries';

const defaultEntries = [
    {
        date: '2026-07-01',
        topic: 'Kihon',
        description: 'Práctica de posiciones básicas, respiración y agarres correctos.'
    },
    {
        date: '2026-07-03',
        topic: 'Kata',
        description: 'Trabajo de forma y fluidez en el kata Heian Shodan.'
    },
    {
        date: '2026-07-05',
        topic: 'Kumite',
        description: 'Ejercicios de defensa personal y control de distancia.'
    },
    {
        date: '2026-07-08',
        topic: 'Flexibilidad',
        description: 'Rutina de movilidad para mejorar la técnica y evitar lesiones.'
    },
    {
        date: '2026-07-10',
        topic: 'Kata',
        description: 'Repaso del kata Tekki Shodan con enfoque en precisión.'
    }
];

let entries = [];
let currentFilters = { date: '', topic: '' };
let editingEntryId = null;

const entriesList = document.getElementById('entries-list');
const form = document.getElementById('search-form');
const dateInput = document.getElementById('date-filter');
const topicInput = document.getElementById('topic-filter');
const resetBtn = document.getElementById('reset-btn');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const entryForm = document.getElementById('entry-form');
const entryDateInput = document.getElementById('entry-date');
const entryTopicInput = document.getElementById('entry-topic');
const entryDescriptionInput = document.getElementById('entry-description');
const statusMessage = document.getElementById('status-message');

function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.background = isError ? '#fef2f2' : '#eff6ff';
    statusMessage.style.color = isError ? '#b91c1c' : '#1d4ed8';
}

function loadEntriesFromLocalStorage() {
    try {
        const storedEntries = localStorage.getItem(STORAGE_KEY);
        return storedEntries ? JSON.parse(storedEntries) : defaultEntries;
    } catch (error) {
        console.error('No se pudieron cargar los registros guardados:', error);
        return defaultEntries;
    }
}

function saveEntriesToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

async function loadEntries() {
    entries = loadEntriesFromLocalStorage();
    showStatus('Tus clases se guardan en este navegador.');
    renderEntries();
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

function getFilteredEntries() {
    return entries.filter((entry) => {
        const matchesDate = !currentFilters.date || entry.date === currentFilters.date;
        const matchesTopic = !currentFilters.topic || entry.topic.toLowerCase().includes(currentFilters.topic);
        return matchesDate && matchesTopic;
    });
}

function renderEntries() {
    const filteredEntries = getFilteredEntries();

    if (filteredEntries.length === 0) {
        entriesList.innerHTML = '<div class="empty-state">No se encontraron clases con esos filtros.</div>';
        return;
    }

    entriesList.innerHTML = filteredEntries
        .map(
            (entry) => `
        <article class="entry-card">
          <div class="entry-header">
            <div>
              <span class="entry-date">${formatDate(entry.date)}</span>
              <span class="entry-topic">${entry.topic}</span>
            </div>
            <div class="entry-actions">
              <button type="button" class="edit-btn" data-id="${entry.id}">Editar</button>
              <button type="button" class="delete-btn" data-id="${entry.id}">Eliminar</button>
            </div>
          </div>
          <p class="entry-description">${entry.description}</p>
        </article>
      `
        )
        .join('');
}

function applyFilter(event) {
    event.preventDefault();

    currentFilters = {
        date: dateInput.value,
        topic: topicInput.value.trim().toLowerCase()
    };

    renderEntries();
}

function resetFilter() {
    form.reset();
    currentFilters = {
        date: '',
        topic: ''
    };
    renderEntries();
}

function toggleEntryForm() {
    entryForm.classList.toggle('hidden');
    toggleFormBtn.textContent = entryForm.classList.contains('hidden') ? 'Agregar clase' : 'Cancelar';
}

function prepareEditEntry(id) {
    const entry = entries.find((item) => item.id === id);
    if (!entry) return;

    editingEntryId = id;
    entryDateInput.value = entry.date;
    entryTopicInput.value = entry.topic;
    entryDescriptionInput.value = entry.description;
    toggleFormBtn.textContent = 'Cancelar edición';
    entryForm.classList.remove('hidden');
    entryDateInput.focus();
}

async function saveEntry(event) {
    event.preventDefault();

    const date = entryDateInput.value;
    const topic = entryTopicInput.value.trim();
    const description = entryDescriptionInput.value.trim();

    if (!date || !topic || !description) {
        alert('Completa fecha, tema y descripción para guardar la clase.');
        return;
    }

    if (editingEntryId) {
        entries = entries.map((item) => (item.id === editingEntryId ? { ...item, date, topic, description } : item));
    } else {
        entries.unshift({ id: Date.now().toString(), date, topic, description });
    }
    saveEntriesToLocalStorage();
    showStatus(editingEntryId ? 'Clase actualizada localmente.' : 'Clase guardada localmente.');

    editingEntryId = null;
    entryForm.reset();
    toggleEntryForm();
    renderEntries();
}

async function deleteEntry(id) {
    if (!confirm('¿Deseas eliminar esta clase?')) return;

    entries = entries.filter((item) => item.id !== id);
    saveEntriesToLocalStorage();
    showStatus('Clase eliminada localmente.');

    renderEntries();
}

function handleEntriesClick(event) {
    const editButton = event.target.closest('.edit-btn');
    const deleteButton = event.target.closest('.delete-btn');

    if (editButton) {
        prepareEditEntry(editButton.dataset.id);
    }

    if (deleteButton) {
        deleteEntry(deleteButton.dataset.id);
    }
}

form.addEventListener('submit', applyFilter);
resetBtn.addEventListener('click', resetFilter);
toggleFormBtn.addEventListener('click', toggleEntryForm);
entryForm.addEventListener('submit', saveEntry);
entriesList.addEventListener('click', handleEntriesClick);

window.addEventListener('DOMContentLoaded', async () => {
    await loadEntries();
});
