/* =================================================
FILE: js/main.js
PURPOSE: Router for View 1, 2, 3, 4, 5, and 6
UPDATED: 2026-05-29 06:15:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

import { renderFacilities } from '../views/v1_facilitiesDashboard.js';
import { renderFacilityControls } from '../views/v2_facilityControls.js';
import { renderContacts as renderFacilityContacts } from '../views/v3_FacilityContacts.js';
import { renderPendingProjects } from '../views/v4_pendingProjects.js';
import { renderFacilityIssues } from '../views/v5_FacilityIssues.js';
import { renderFacilityImages } from '../views/v6_FacilityImages.js';

window.navigateTo = (view, data = null) => {
    const app = document.getElementById('app');
    if (!app) {
        console.error("Critical Error: Element with ID 'app' not found.");
        return;
    }
    
    app.innerHTML = '';
    app.style.backgroundColor = ''; 

    console.log(`Navigating to: ${view}`, data);

    if (view === 'dashboard') {
        renderFacilities();
    } 
    else if (view === 'facilityControls') {
        renderFacilityControls(data);
    } 
    else if (view === 'facilityContacts' || view === 'facilityInfo') { 
        renderFacilityContacts(data);
    } 
    else if (view === 'pendingProjects') {
        renderPendingProjects(data);
    }
    else if (view === 'facilityIssues') {
        renderFacilityIssues(data);
    }
    else if (view === 'facilityImages') {
        renderFacilityImages(data);
    }
    else {
        console.warn(`View "${view}" not recognized. Defaulting to dashboard.`);
        renderFacilities();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    renderFacilities();
});
