/* =================================================
FILE: views/v3_FacilityContacts.js
PURPOSE: Render Facility Contacts and Contact Detail View
UPDATED: 2026-05-29 06:05:00 PM
================================================= */

import { supabase } from '../js/supabaseClient.js';

export async function openContactDetail(contact, facility) {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; background:#f3f4f6; text-align:center;">
            <div style="max-width:500px; margin:0 auto; background:white; border-radius:12px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05); text-align:left;">
                <h2 style="text-align:center; color:#00264d;">${contact.Name || 'Unnamed'}</h2>
                <div style="margin-top:30px; display:flex; flex-direction:column; gap:10px;">
                    <button id="closeDetailBtn" style="padding:12px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">CLOSE DETAILS</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('closeDetailBtn').onclick = () => renderContacts({ facility });
}

export async function renderContacts(data) {
    const app = document.getElementById('app');
    if (!app) return;

    const facility = data?.facility || data || {};

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; text-align:center; background:#f3f4f6;">
            <h1 style="color:#00264d;">${facility?.Name || 'FACILITY'} CONTACTS</h1>
            <div style="margin-bottom:25px; display:flex; gap:10px; justify-content:center;">
                <button id="backBtn" style="padding:14px 20px; border:none; border-radius:8px; background:#00264d; color:white; font-weight:bold; cursor:pointer;">BACK TO DASHBOARD</button>
            </div>
            <div id="contactsGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:15px;"></div>
        </div>
    `;

    // Back Button Logic
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.onclick = (e) => {
            e.preventDefault();
            const fId = facility.id || facility.facility_id;
            
            if (fId) {
                window.location.hash = `#facilityControls?id=${fId}`;
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

    const loadContactsGridData = async () => {
        const { data: contacts } = await supabase.from('CONTACTS').select('*').eq('facility_id', facility?.id);
        const grid = document.getElementById('contactsGrid');
        if (contacts && grid) {
            contacts.forEach(c => {
                const b = document.createElement('button');
                b.innerText = c.Name;
                b.onclick = () => openContactDetail(c, facility);
                grid.appendChild(b);
            });
        }
    };

    await loadContactsGridData();
}
