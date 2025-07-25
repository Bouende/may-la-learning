// ========================================
// SITE WEB INTERACTIF - SCRIPT PRINCIPAL
// ========================================

// ========================================
// DONNÉES MOCK
// ========================================

const mockFormData = [
    {
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        nomUtilisateur: 'jdupont',
        email: 'jean.dupont@email.com',
        adresse: '123 Rue de la Paix, Paris',
        telephone: '+33 1 23 45 67 89',
        autres: 'Développeur web',
        dateSubmission: '2024-12-15 14:30'
    },
    {
        id: 2,
        nom: 'Martin',
        prenom: 'Marie',
        nomUtilisateur: 'mmartin',
        email: 'marie.martin@email.com',
        adresse: '456 Avenue des Champs, Lyon',
        telephone: '+33 4 56 78 90 12',
        autres: 'Designer UI/UX',
        dateSubmission: '2024-12-15 15:45'
    },
    {
        id: 3,
        nom: 'Leroy',
        prenom: 'Pierre',
        nomUtilisateur: 'pleroy',
        email: 'pierre.leroy@email.com',
        adresse: '789 Boulevard de la République, Marseille',
        telephone: '+33 4 91 23 45 67',
        autres: 'Chef de projet',
        dateSubmission: '2024-12-15 16:20'
    }
];

const mockMapLocations = [
    {
        id: 1,
        name: 'Paris',
        lat: 48.8566,
        lng: 2.3522,
        description: 'Capitale de la France',
        users: 15
    },
    {
        id: 2,
        name: 'Lyon',
        lat: 45.7640,
        lng: 4.8357,
        description: 'Deuxième ville de France',
        users: 8
    },
    {
        id: 3,
        name: 'Marseille',
        lat: 43.2965,
        lng: 5.3698,
        description: 'Port méditerranéen',
        users: 12
    },
    {
        id: 4,
        name: 'Toulouse',
        lat: 43.6047,
        lng: 1.4442,
        description: 'Ville rose',
        users: 6
    }
];

const defaultUserPreferences = {
    theme: 'light',
    language: 'fr',
    mapZoom: 6,
    mapCenter: [46.603354, 1.888334], // Centre de la France
    notifications: true,
    autoSave: false
};

// ========================================
// VARIABLES GLOBALES
// ========================================

let map = null;
let formData = [...mockFormData];
let currentMapState = {
    center: [46.603354, 1.888334],
    zoom: 6
};
let markers = [];

// ========================================
// GESTION DES COOKIES
// ========================================

const cookieManager = {
    setUserPreferences: (preferences) => {
        try {
            const data = JSON.stringify(preferences);
            Cookies.set('user_preferences', data, { expires: 365 });
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des préférences:', error);
            return false;
        }
    },

    getUserPreferences: () => {
        try {
            const data = Cookies.get('user_preferences');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération des préférences:', error);
            return null;
        }
    },

    setFormData: (formData) => {
        try {
            const data = JSON.stringify(formData);
            Cookies.set('form_data_temp', data, { expires: 1 });
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du formulaire:', error);
            return false;
        }
    },

    getFormData: () => {
        try {
            const data = Cookies.get('form_data_temp');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération du formulaire:', error);
            return null;
        }
    },

    clearFormData: () => {
        Cookies.remove('form_data_temp');
    },

    setMapState: (mapState) => {
        try {
            const data = JSON.stringify(mapState);
            Cookies.set('map_state', data, { expires: 365 });
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'état de la carte:', error);
            return false;
        }
    },

    getMapState: () => {
        try {
            const data = Cookies.get('map_state');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'état de la carte:', error);
            return null;
        }
    },

    hasConsent: () => {
        return Cookies.get('cookie_consent') === 'accepted';
    },

    setConsent: (accepted) => {
        if (accepted) {
            Cookies.set('cookie_consent', 'accepted', { expires: 365 });
        } else {
            Cookies.set('cookie_consent', 'declined', { expires: 30 });
        }
    },

    clearAllCookies: () => {
        const cookieNames = ['user_preferences', 'form_data_temp', 'map_state', 'cookie_consent'];
        cookieNames.forEach(name => {
            Cookies.remove(name);
        });
    }
};

// ========================================
// INITIALISATION DE LA CARTE
// ========================================

function initializeMap() {
    const savedMapState = cookieManager.getMapState();
    if (savedMapState) {
        currentMapState = savedMapState;
    }

    map = L.map('map').setView(currentMapState.center, currentMapState.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mockMapLocations.forEach(location => {
        const marker = L.marker([location.lat, location.lng]).addTo(map);
        
        const popupContent = `
            <div class="text-center">
                <h5 style="color: #0d6efd; font-weight: bold; margin-bottom: 0.5rem;">${location.name}</h5>
                <p style="margin-bottom: 0.5rem; font-size: 0.9rem;">${location.description}</p>
                <span class="badge bg-success">
                    ${location.users} utilisateur${location.users > 1 ? 's' : ''}
                </span>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        marker.on('click', () => {
            showSelectedLocation(location);
        });
        
        markers.push(marker);
    });

    map.on('moveend', () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        currentMapState = {
            center: [center.lat, center.lng],
            zoom: zoom
        };
        cookieManager.setMapState(currentMapState);
        updateMapPosition();
    });

    map.on('zoomend', () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        currentMapState = {
            center: [center.lat, center.lng],
            zoom: zoom
        };
        cookieManager.setMapState(currentMapState);
        updateMapPosition();
    });
}

function showSelectedLocation(location) {
    const selectedDiv = document.getElementById('selected-location');
    const nameEl = document.getElementById('location-name');
    const descEl = document.getElementById('location-description');
    const usersEl = document.getElementById('location-users');
    
    nameEl.textContent = location.name;
    descEl.textContent = location.description;
    usersEl.textContent = `${location.users} utilisateur${location.users > 1 ? 's' : ''}`;
    
    selectedDiv.classList.remove('d-none');
}

function updateMapPosition() {
    const positionEl = document.getElementById('map-position');
    positionEl.innerHTML = `
        Latitude: ${currentMapState.center[0].toFixed(4)}<br/>
        Longitude: ${currentMapState.center[1].toFixed(4)}<br/>
        Zoom: ${currentMapState.zoom}
    `;
}

// ========================================
// GESTION DU FORMULAIRE
// ========================================

function initializeForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    
    const savedData = cookieManager.getFormData();
    if (savedData) {
        Object.keys(savedData).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = savedData[key];
            }
        });
    }

    form.addEventListener('input', (e) => {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        if (Object.values(data).some(value => value.trim() !== '')) {
            cookieManager.setFormData(data);
        }
    });

    form.addEventListener('input', (e) => {
        validateField(e.target);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            await submitForm();
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    switch (field.name) {
        case 'nom':
        case 'prenom':
            isValid = value.length > 0;
            message = `Le ${field.name} est requis`;
            break;
            
        case 'nomUtilisateur':
            isValid = value.length >= 3;
            message = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
            if (value.length === 0) {
                message = 'Le nom d\'utilisateur est requis';
                isValid = false;
            }
            break;
            
        case 'email':
            const emailRegex = /\S+@\S+\.\S+/;
            isValid = emailRegex.test(value);
            message = 'L\'email n\'est pas valide';
            if (value.length === 0) {
                message = 'L\'email est requis';
                isValid = false;
            }
            break;
            
        case 'adresse':
            isValid = value.length > 0;
            message = 'L\'adresse est requise';
            break;
            
        case 'telephone':
            const phoneRegex = /^[\+]?\d[\d\s\-()]{9,}$/;
            isValid = phoneRegex.test(value.replace(/\s/g, ''));
            message = 'Le numéro de téléphone n\'est pas valide';
            if (value.length === 0) {
                message = 'Le numéro de téléphone est requis';
                isValid = false;
            }
            break;
    }

    if (field.name !== 'autres') { // Le champ "autres" n'est pas obligatoire
        const feedback = field.nextElementSibling;
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            if (feedback) feedback.textContent = '';
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            if (feedback) feedback.textContent = message;
        }
    }

    return isValid;
}

function validateForm() {
    const form = document.getElementById('contact-form');
    const fields = form.querySelectorAll('input[required], textarea[required]');
    let isFormValid = true;

    fields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    return isFormValid;
}

async function submitForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    
    submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Envoi en cours...
    `;
    submitBtn.disabled = true;

    try {
        // Simuler l'envoi
        await new Promise(resolve => setTimeout(resolve, 1500));

        const formData = new FormData(form);
        const newEntry = {
            id: Date.now(),
            dateSubmission: new Date().toLocaleString('fr-FR')
        };

        for (let [key, value] of formData.entries()) {
            newEntry[key] = value;
        }

        formData.push(newEntry);
        updateDataPanel();

        form.reset();
        form.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });

        cookieManager.clearFormData();
        showSuccessAlert();

    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
    } finally {
        submitBtn.innerHTML = `
            <i class="fas fa-paper-plane me-2"></i>
            Envoyer le formulaire
        `;
        submitBtn.disabled = false;
    }
}

function showSuccessAlert() {
    const alert = document.getElementById('success-alert');
    alert.classList.remove('d-none');
    alert.classList.add('show');
    
    setTimeout(() => {
        hideSuccessAlert();
    }, 5000);
}

function hideSuccessAlert() {
    const alert = document.getElementById('success-alert');
    alert.classList.remove('show');
    alert.classList.add('d-none');
}

function updateDataPanel() {
    const totalEl = document.getElementById('total-entries');
    const submissionsEl = document.getElementById('recent-submissions');
    
    totalEl.textContent = formData.length;

    const recent = formData.slice(-3).reverse();
    submissionsEl.innerHTML = recent.map(item => `
        <div class="border-bottom py-2">
            <strong>${item.prenom} ${item.nom}</strong><br/>
            <small class="text-muted">${item.dateSubmission}</small>
        </div>
    `).join('');
}

// ========================================
// EXPORT EXCEL
// ========================================

function exportToExcel() {
    if (formData.length === 0) {
        alert('Aucune donnée à exporter');
        return;
    }

    try {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(formData);

        const columnWidths = [
            { wch: 10 }, // ID
            { wch: 15 }, // Nom
            { wch: 15 }, // Prénom
            { wch: 20 }, // Nom d'utilisateur
            { wch: 25 }, // Email
            { wch: 30 }, // Adresse
            { wch: 15 }, // Téléphone
            { wch: 20 }, // Autres
            { wch: 20 }  // Date de soumission
        ];

        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `donnees_formulaire_${timestamp}.xlsx`;

        XLSX.writeFile(workbook, filename);

        alert('Export Excel réussi !');

    } catch (error) {
        console.error('Erreur lors de l\'export Excel:', error);
        alert('Erreur lors de l\'export Excel');
    }
}

// ========================================
// GESTION DES COOKIES - CONSENTEMENT
// ========================================

function initializeCookieConsent() {
    if (!cookieManager.hasConsent()) {
        document.getElementById('cookie-consent-modal').style.display = 'block';
    }
}

function acceptAllCookies() {
    document.getElementById('necessary').checked = true;
    document.getElementById('analytics').checked = true;
    document.getElementById('marketing').checked = true;
    
    cookieManager.setConsent(true);
    document.getElementById('cookie-consent-modal').style.display = 'none';
}

function declineAllCookies() {
    document.getElementById('necessary').checked = true; // Toujours requis
    document.getElementById('analytics').checked = false;
    document.getElementById('marketing').checked = false;
    
    cookieManager.setConsent(false);
    document.getElementById('cookie-consent-modal').style.display = 'none';
}

function savePreferences() {
    cookieManager.setConsent(true);
    
    const preferences = {
        necessary: document.getElementById('necessary').checked,
        analytics: document.getElementById('analytics').checked,
        marketing: document.getElementById('marketing').checked
    };
    
    const userPrefs = cookieManager.getUserPreferences() || defaultUserPreferences;
    userPrefs.cookiePreferences = preferences;
    cookieManager.setUserPreferences(userPrefs);
    
    document.getElementById('cookie-consent-modal').style.display = 'none';
}

// ========================================
// GESTION DES PRÉFÉRENCES UTILISATEUR
// ========================================

function initializeUserPreferences() {
    const preferences = cookieManager.getUserPreferences() || defaultUserPreferences;
    
    document.getElementById('theme-select').value = preferences.theme;
    document.getElementById('language-select').value = preferences.language;
    document.getElementById('map-zoom-range').value = preferences.mapZoom;
    document.getElementById('zoom-value').textContent = preferences.mapZoom;
    document.getElementById('notifications').checked = preferences.notifications;
    document.getElementById('autoSave').checked = preferences.autoSave;
    
    document.getElementById('map-zoom-range').addEventListener('input', (e) => {
        document.getElementById('zoom-value').textContent = e.target.value;
    });
}

function toggleSettingsPanel() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('d-none');
}

function saveUserPreferences() {
    const preferences = {
        theme: document.getElementById('theme-select').value,
        language: document.getElementById('language-select').value,
        mapZoom: parseInt(document.getElementById('map-zoom-range').value),
        mapCenter: currentMapState.center,
        notifications: document.getElementById('notifications').checked,
        autoSave: document.getElementById('autoSave').checked
    };
    
const success = cookieManager.setUserPreferences(preferences);
    showSettingsStatus(success ? 'success' : 'error');
}

function resetPreferences() {
    cookieManager.setUserPreferences(defaultUserPreferences);
    initializeUserPreferences();
    showSettingsStatus('reset');
}

function clearAllCookies() {
    cookieManager.clearAllCookies();
    initializeUserPreferences();
    showSettingsStatus('cleared');
}

function showSettingsStatus(type) {
    const statusEl = document.getElementById('settings-status');
    const messages = {
        success: 'Préférences sauvegardées !',
        error: 'Erreur lors de la sauvegarde',
        reset: 'Préférences réinitialisées',
        cleared: 'Tous les cookies supprimés'
    };
    
    const alertClass = type === 'success' ? 'alert-success' :
                       type === 'error' ? 'alert-danger' :
                       type === 'reset' ? 'alert-info' : 'alert-warning';
    
    statusEl.className = `alert ${alertClass}`;
    statusEl.querySelector('small').textContent = messages[type];
    statusEl.classList.remove('d-none');
    
    setTimeout(() => {
        statusEl.classList.add('d-none');
    }, 3000);
}

// ========================================
// NAVIGATION FLUIDE
// ========================================

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des composants
    initializeMap();
    initializeForm();
    initializeCookieConsent();
    initializeUserPreferences();
    initializeSmoothScrolling();
    updateDataPanel();

    // Event listeners pour les boutons
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    document.getElementById('settings-btn').addEventListener('click', toggleSettingsPanel);

    // Fermer le panneau de paramètres en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('settings-panel');
        const btn = document.getElementById('settings-btn');
        
        if (!panel.contains(e.target) && !btn.contains(e.target) && !panel.classList.contains('d-none')) {
            panel.classList.add('d-none');
        }
    });

    console.log('✅ Site Web Interactif initialisé avec succès!');
});

// ========================================
// UTILITAIRES GLOBAUX
// ========================================

// Fonction utilitaire pour déboguer
function debugInfo() {
    console.log('=== DEBUG INFO ===');
    console.log('Données formulaire:', formData);
    console.log('État carte:', currentMapState);
    console.log('Préférences:', cookieManager.getUserPreferences());
    console.log('Consentement cookies:', cookieManager.hasConsent());
}

// Exposer certaines fonctions globalement pour le HTML
window.hideSuccessAlert = hideSuccessAlert;
window.acceptAllCookies = acceptAllCookies;
window.declineAllCookies = declineAllCookies;
window.savePreferences = savePreferences;
window.toggleSettingsPanel = toggleSettingsPanel;
window.saveUserPreferences = saveUserPreferences;
window.resetPreferences = resetPreferences;
window.clearAllCookies = clearAllCookies;
window.debugInfo = debugInfo;
