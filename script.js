// ========================================
// SITE WEB INTERACTIF - SCRIPT PRINCIPAL
// ========================================

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

let users = []; // Liste des utilisateurs

// ========================================
// GESTION DES COOKIES
// ========================================

const cookieManager = {
    // Sauvegarder les préférences utilisateur
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

    // Récupérer les préférences utilisateur
    getUserPreferences: () => {
        try {
            const data = Cookies.get('user_preferences');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération des préférences:', error);
            return null;
        }
    },

    // Sauvegarder temporairement les données du formulaire
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

    // Récupérer les données temporaires du formulaire
    getFormData: () => {
        try {
            const data = Cookies.get('form_data_temp');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération du formulaire:', error);
            return null;
        }
    },

    // Supprimer les données temporaires du formulaire
    clearFormData: () => {
        Cookies.remove('form_data_temp');
    },

    // Sauvegarder l'état de la carte
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

    // Récupérer l'état de la carte
    getMapState: () => {
        try {
            const data = Cookies.get('map_state');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'état de la carte:', error);
            return null;
        }
    },

    // Vérifier le consentement aux cookies
    hasConsent: () => {
        return Cookies.get('cookie_consent') === 'accepted';
    },

    // Définir le consentement aux cookies
    setConsent: (accepted) => {
        if (accepted) {
            Cookies.set('cookie_consent', 'accepted', { expires: 365 });
        } else {
            Cookies.set('cookie_consent', 'declined', { expires: 30 });
        }
    },

    // Supprimer tous les cookies
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
    const currentMapState = savedMapState || { center: [46.603354, 1.888334], zoom: 6 };

    const map = L.map('map').setView(currentMapState.center, currentMapState.zoom);

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
    });

    map.on('moveend', () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        cookieManager.setMapState({ center: [center.lat, center.lng], zoom });
    });

    map.on('zoomend', () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        cookieManager.setMapState({ center: [center.lat, center.lng], zoom });
    });
}

// ========================================
// MISE À JOUR DE LA LISTE DES UTILISATEURS
// ========================================

function updateUserList() {
    const userListEl = document.getElementById('user-list');
    userListEl.innerHTML = ''; // Réinitialiser la liste

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.nom}</td>
            <td>${user.prenom}</td>
            <td>${user.nomUtilisateur}</td>
            <td>${user.email}</td>
            <td>${user.adresse}</td>
            <td>${user.telephone}</td>
        `;
        userListEl.appendChild(row);
    });
}

// ========================================
// GESTION DU FORMULAIRE
// ========================================

function initializeForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newUser = {
            nom: form.nom.value,
            prenom: form.prenom.value,
            nomUtilisateur: form.nomUtilisateur.value,
            email: form.email.value,
            adresse: form.adresse.value,
            telephone: form.telephone.value,
        };

        users.push(newUser); // Ajouter le nouvel utilisateur à la liste
        updateUserList(); // Mettre à jour l'affichage de la liste
        form.reset(); // Réinitialiser le formulaire
        showSuccessAlert(); // Afficher l'alerte de succès
    });
}

// ========================================
// AFFICHAGE DE L'ALERTE DE SUCCÈS
// ========================================

function showSuccessAlert() {
    const alert = document.getElementById('success-alert');
    alert.classList.remove('d-none');
    alert.classList.add('show');

    setTimeout(() => {
        alert.classList.remove('show');
        alert.classList.add('d-none');
    }, 5000);
}

// ========================================
// EXPORTATION EN EXCEL
// ========================================

function exportToExcel() {
    if (users.length === 0) {
        alert('Aucune donnée à exporter');
        return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({
        Nom: user.nom,
        Prénom: user.prenom,
        NomUtilisateur: user.nomUtilisateur,
        Email: user.email,
        Adresse: user.adresse,
        Téléphone: user.telephone
    })));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs');

    const filename = `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    alert('Export Excel réussi !');
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
    
    // Sauvegarder dans les préférences utilisateur
    const userPrefs = cookieManager.getUserPreferences() || {};
    userPrefs.cookiePreferences = preferences;
    cookieManager.setUserPreferences(userPrefs);
    
    document.getElementById('cookie-consent-modal').style.display = 'none';
}

// ========================================
// GESTION DES PRÉFÉRENCES UTILISATEUR
// ========================================

function initializeUserPreferences() {
    const preferences = cookieManager.getUserPreferences() || {
        theme: 'light',
        language: 'fr',
        mapZoom: 6,
        notifications: true,
        autoSave: true
    };
    
    // Charger les préférences dans l'interface
    document.getElementById('theme-select').value = preferences.theme;
    document.getElementById('language-select').value = preferences.language;
    document.getElementById('map-zoom-range').value = preferences.mapZoom;
    document.getElementById('zoom-value').textContent = preferences.mapZoom;
    document.getElementById('notifications').checked = preferences.notifications;
    document.getElementById('autoSave').checked = preferences.autoSave;
    
    // Event listeners pour les contrôles
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
        notifications: document.getElementById('notifications').checked,
        autoSave: document.getElementById('autoSave').checked
    };
    
    const success = cookieManager.setUserPreferences(preferences);
    showSettingsStatus(success ? 'success' : 'error');
}

function resetPreferences() {
    cookieManager.setUserPreferences({
        theme: 'light',
        language: 'fr',
        mapZoom: 6,
        notifications: true,
        autoSave: true
    });
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
    updateUserList(); // Afficher les utilisateurs initiaux

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
    console.log('Données utilisateur:', users);
    console.log('Préférences:', cookieManager.getUserPreferences());
    console.log('Consentement cookies:', cookieManager.hasConsent());
}

// Exposer certaines fonctions globalement pour le HTML
window.showSuccessAlert= showSuccessAlert;
window.acceptAllCookies = acceptAllCookies;
window.declineAllCookies = declineAllCookies;
window.savePreferences = savePreferences;
window.toggleSettingsPanel = toggleSettingsPanel;
window.saveUserPreferences = saveUserPreferences;
window.resetPreferences = resetPreferences;
window.clearAllCookies = clearAllCookies;
window.debugInfo = debugInfo;
