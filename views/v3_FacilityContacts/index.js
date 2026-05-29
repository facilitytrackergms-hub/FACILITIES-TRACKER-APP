/* =================================================
FILE: views/v3_FacilityContacts/index.js
PURPOSE: Main Controller for Facility Contacts View
UPDATED: 2026-05-29 07:30:00 PM
================================================= */

import { renderContactGrid } from './v3_ContactGrid.js';
import { renderContactDetail } from './v3_ContactDetail.js';
import { injectContactModal, openNewContactModal } from './v3_ContactModal.js';

export async function renderContacts(data) {
    const app = document.getElementById('app');
    if (!app) return;

    // 1. Identify the Facility
    const facility = data?.facility ? data.facility : data;
    const initialContact = data?.contact ? data.contact : null;

    // 2. Setup the Main Wrapper Template
    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; text-align:center; background:#f3f4f6;">
            <h1 style="font-size:22px; margin-bottom:5px; color:#00264d; text-transform:uppercase;">
                ${facility?.Name || 'FACILITY'} CONTACTS
            </h1>
            <p style="color:#6b7280; margin-bottom:20px;">Manage contacts and personnel profiles</p>
            
            <div style="margin-bottom:25px; display:flex; gap:10px; justify-content:center;">
                <button id="addManualContactBtn" style="padding:14px 20px; border:none; border-radius:8px; background:#28a745; color:white; font-weight:bold; cursor:pointer;">+ ADD NEW CONTACT</button>
                <button id="backToControlsBtn" style="padding:14px 20px; border:none; border-radius:8px; background:#00264d; color:white; font-weight:bold; cursor:pointer;">BACK TO CONTROLS</button>
            </div>

            <div id="contactsContentContainer"></div>

            <div id="viewVersionTag" style="margin-top:50px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                Loading version info...
            </div>
        </div>
    `;

    const contentContainer = document.getElementById('contactsContentContainer');

    // 3. Define the Navigation Logic
    const showGrid = () => {
        renderContactGrid(contentContainer, facility, (contact) => {
            showDetail(contact);
        });
        updateVersionTag('v3_ContactGrid.js');
    };

    const showDetail = (contact) => {
        renderContactDetail(contentContainer, contact, facility, () => {
            showGrid();
        });
        updateVersionTag('v3_ContactDetail.js');
    };

    const updateVersionTag = (activeFile) => {
        const tag = document.getElementById('viewVersionTag');
        if (tag) {
            tag.innerText = `Active File: ${activeFile} | Folder: v3_FacilityContacts | Updated: 2026-05-29`;
        }
    };

    // 4. Initialize Components
    injectContactModal(app, () => showGrid());

    // 5. Button Listeners
    document.getElementById('addManualContactBtn').onclick = () => {
        openNewContactModal(facility.id);
    };

    document.getElementById('backToControlsBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('facilityControls', facility);
    };

    // 6. Initial Load Logic
    if (initialContact) {
        showDetail(initialContact);
    } else {
        showGrid();
    }
}
