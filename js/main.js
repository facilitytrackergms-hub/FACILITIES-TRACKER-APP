/* =================================================
FILE: js/main.js
PURPOSE: Router for View 1, 2, 3, 4, 5, and 6
UPDATED: 2026-05-29 06:40:00 PM
================================================= */

import { renderFacilities } from '../views/v1_facilitiesDashboard.js';
import { renderFacilityControls } from '../views/v2_facilityControls.js';
import { renderContacts as renderFacilityContacts } from '../views/v3_FacilityContacts.js';
import { renderPendingProjects } from '../views/v4_pendingProjects.js';
import { renderFacilityIssues } from '../views/v5_FacilityIssues.js';
import { renderFacilityImages } from '../views/v6_FacilityImages.js';

window.navigateTo = (view, data = null) => {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = '';
    console.log(`Navigating to: ${view}`, data);

    if (view === 'dashboard') {
        renderFacilities();
    } 
    else if (view === 'facilityControls') {
        renderFacilityControls(data);
    } 
    else if (view === 'facilityContacts') { 
        renderFacilityContacts(data);
    } 
    else if (view === 'facilityIssues') {
        renderFacilityIssues(data);
    }
    else if (view === 'facilityImages') {
        renderFacilityImages(data);
    }
    else {
        renderFacilities();
    }
};

// CRITICAL FIX: The Listener that connects View 3 to this Router
window.addEventListener('navigate', (e) => {
    const { target, data } = e.detail;
    console.log("Router caught navigate event:", target);
    window.navigateTo(target, data);
});

// Initial Start
document.addEventListener('DOMContentLoaded', () => {
    renderFacilities();
});
