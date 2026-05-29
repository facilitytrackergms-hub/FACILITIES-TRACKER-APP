/* =================================================
FILE: views/v2_facilityControls.js
UPDATED: 2026-05-29 07:30:00 PM
================================================= */

import { supabase } from '../js/supabaseClient.js';
import { navigateTo } from '../js/main.js';

export async function renderFacilityControls(facility) {
    if (!facility || !facility.id) {
        console.error("Invalid facility passed to renderFacilityControls:", facility);
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="padding:20px;font-family:Arial;background:#f3f4f6;min-height:100vh;">
            <h1 style="color:#00264d;">${facility.Name}</h1>
            <p>${facility.Address}</p>
            <p>${facility.Phone || ''}</p>
            <p>${facility.Notes || ''}</p>

            <div style="display:flex;gap:12px;margin-top:20px;">
                <button id="toContacts" style="flex:1;padding:12px;background:#007bff;color:white;border:none;border-radius:6px;cursor:pointer;">Contacts</button>
                <button id="toProjects" style="flex:1;padding:12px;background:#28a745;color:white;border:none;border-radius:6px;cursor:pointer;">Projects</button>
                <button id="toGallery" style="flex:1;padding:12px;background:#f5c400;color:white;border:none;border-radius:6px;cursor:pointer;">Gallery</button>
                <button id="toIssues" style="flex:1;padding:12px;background:#dc2626;color:white;border:none;border-radius:6px;cursor:pointer;">Issues</button>
            </div>
        </div>
    `;

    document.getElementById('toContacts').onclick = () => {
        if (!facility?.id) { console.error("Cannot navigate to contacts, facility invalid:", facility); return; }
        navigateTo('facilityContacts', facility);
    };

    document.getElementById('toProjects').onclick = () => {
        if (!facility?.id) { console.error("Cannot navigate to projects, facility invalid:", facility); return; }
        navigateTo('pendingProjects', facility);
    };

    document.getElementById('toGallery').onclick = () => {
        if (!facility?.id) { console.error("Cannot navigate to gallery, facility invalid:", facility); return; }
        navigateTo('facilityImages', facility);
    };

    document.getElementById('toIssues').onclick = () => {
        if (!facility?.id) { console.error("Cannot navigate to issues, facility invalid:", facility); return; }
        navigateTo('facilityIssues', facility);
    };
}
