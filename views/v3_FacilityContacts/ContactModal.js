/* =================================================
FILE: views/v3_FacilityContacts/v3_ContactModal.js
PURPOSE: Render and Manage the New Contact Form Modal
UPDATED: 2026-05-29 07:15:00 PM
================================================= */

import { saveNewContact } from './v3_ContactData.js';

/**
 * Renders the Manual Contact Modal HTML into the document
 */
export function injectContactModal(container, onSaveSuccess) {
    const modalHtml = `
        <div id="manualContactModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:2000; justify-content:center; align-items:center; padding:20px;">
            <div style="background:white; padding:25px; border-radius:12px; width:100%; max-width:420px; text-align:left; max-height:90vh; overflow-y:auto; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                <h3 id="modalTitle" style="margin-top:0; color:#00264d; border-bottom:2px solid #f5c400; padding-bottom:10px;">New Contact Profile</h3>
                
                <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">NAME</label>
                <input type="text" id="manualContactName" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px;" placeholder="Full Name">
                
                <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">ROLE</label>
                <input type="text" id="manualContactRole" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px;" placeholder="e.g. Owner, Tenant, Driver">
                
                <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">PHONE</label>
                <input type="text" id="manualContactPhone" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px;" placeholder="Phone Number">
                
                <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">EMAIL</label>
                <input type="email" id="manualContactEmail" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px;" placeholder="Email Address">
                
                <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">NOTES</label>
                <textarea id="manualContactNotes" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px; min-height:60px;" placeholder="Contextual notes..."></textarea>
                
                <div style="display:flex; gap:10px; margin-top:25px;">
                    <button id="manualContactSaveBtn" style="flex:1; padding:13px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">SAVE DETAILS</button>
                    <button id="manualContactCloseBtn" style="flex:1; padding:13px; background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer;">CLOSE</button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', modalHtml);

    // Setup Close Logic
    document.getElementById('manualContactCloseBtn').onclick = () => {
        document.getElementById('manualContactModal').style.display = 'none';
    };

    // Setup Save Logic
    document.getElementById('manualContactSaveBtn').onclick = async () => {
        const name = document.getElementById('manualContactName').value;
        if (!name) return alert('Name is required');

        const contactData = { 
            Name: name, 
            Role: document.getElementById('manualContactRole').value, 
            Phone: document.getElementById('manualContactPhone').value, 
            Email: document.getElementById('manualContactEmail').value, 
            Notes: document.getElementById('manualContactNotes').value, 
            facility_id: window.currentFacilityId // Set by manager
        };

        try {
            await saveNewContact(contactData);
            document.getElementById('manualContactModal').style.display = 'none';
            onSaveSuccess();
        } catch (err) {
            alert("Error saving contact: " + err.message);
        }
    };
}

/**
 * Opens and resets the modal
 */
export function openNewContactModal(facilityId) {
    window.currentFacilityId = facilityId;
    document.getElementById('modalTitle').innerText = "New Contact Profile";
    ['manualContactName', 'manualContactRole', 'manualContactPhone', 'manualContactEmail', 'manualContactNotes'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('manualContactSaveBtn').innerText = "SAVE DETAILS";
    document.getElementById('manualContactModal').style.display = 'flex';
}
