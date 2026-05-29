/* =================================================
FILE: views/v3_FacilityContacts.js
PURPOSE: Render Facility Contacts and Contact Detail View
UPDATED: 2026-05-29 06:40:00 PM
================================================= */

import { supabase } from '../js/supabaseClient.js';

export async function openContactDetail(contact, facility) {
    // ... (Keep your existing openContactDetail code here)
}

export async function renderContacts(data) {
    const app = document.getElementById('app');
    if (!app) return;

    const facility = data?.facility || data || {};

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; text-align:center; background:#f3f4f6;">
            <h1 style="color:#00264d;">${facility?.Name || 'FACILITY'} CONTACTS</h1>
            <div style="margin-bottom:25px; display:flex; gap:10px; justify-content:center;">
                <button id="backBtn" style="padding:14px 20px; background:#00264d; color:white; border-radius:8px; font-weight:bold; cursor:pointer;">BACK TO DASHBOARD</button>
            </div>
            <div id="contactsGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:15px;"></div>
        </div>
    `;

    const loadContactsGridData = async () => {
        const { data: contacts } = await supabase.from('CONTACTS').select('*').eq('facility_id', facility?.id);
        const grid = document.getElementById('contactsGrid');
        if (contacts && grid) {
            contacts.forEach(c => {
                const btn = document.createElement('button');
                btn.innerText = c.Name;
                btn.onclick = () => openContactDetail(c, facility);
                grid.appendChild(btn);
            });
        }
    };

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.onclick = (e) => {
            e.preventDefault();
            const facilityId = facility?.id || facility?.facility_id;
            
            if (facilityId) {
                window.location.hash = `#facilityControls?id=${facilityId}`;
                window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { target: 'facilityControls', data: facility } 
                }));
            } else {
                window.location.hash = `#dashboard`;
                window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { target: 'dashboard', data: {} } 
                }));
            }
        };
    }

    await loadContactsGridData();
} // This closing brace matches the export async function renderContacts(data) {
