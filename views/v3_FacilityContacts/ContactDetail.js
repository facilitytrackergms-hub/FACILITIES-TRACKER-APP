
/* =================================================
FILE: views/v3_FacilityContacts/v3_ContactDetail.js
PURPOSE: Render individual Contact Profile and Links
UPDATED: 2026-05-29 07:05:00 PM
================================================= */

import { getContactImages } from './v3_ContactData.js';

/**
 * Renders the full detail view for a specific contact
 */
export async function renderContactDetail(container, contact, facility, onBack) {
    // Format Links
    const phoneLink = contact.Phone 
        ? `<a href="tel:${contact.Phone.replace(/[^0-9+]/g, '')}" style="color:#00264d; text-decoration:underline; font-weight:bold;">${contact.Phone}</a>` 
        : 'N/A';
        
    const emailLink = contact.Email 
        ? `<a href="mailto:${contact.Email}" style="color:#00264d; text-decoration:underline; font-weight:bold;">${contact.Email}</a>` 
        : 'N/A';

    container.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; background:#f3f4f6; text-align:center;">
            <div style="max-width:500px; margin:0 auto; background:white; border-radius:12px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05); text-align:left;">
                
                <div style="text-align:center; margin-bottom:20px;" id="detailAvatarContainer">
                    </div>

                <h2 style="margin:0 0 5px 0; color:#00264d; text-align:center;">${contact.Name || 'Unnamed Contact'}</h2>
                <p style="margin:0 0 20px 0; color:#6b7280; text-align:center; font-weight:bold;">${contact.Role || 'No Role Assigned'}</p>

                <hr style="border:0; border-top:1px solid #eee; margin-bottom:20px;">

                <div style="margin-bottom:12px;"><strong>Phone:</strong> ${phoneLink}</div>
                <div style="margin-bottom:12px;"><strong>Email:</strong> ${emailLink}</div>
                <div style="margin-bottom:20px;"><strong>Notes:</strong> ${contact.Notes || 'None'}</div>

                <div style="margin-top:30px; display:flex; flex-direction:column; gap:10px;">
                    <button id="addContactIssueBtn" style="padding:14px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:14px; text-transform:uppercase;">+ Add Issue For This Contact</button>
                    <button id="closeDetailBtn" style="padding:12px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">CLOSE DETAILS</button>
                </div>
            </div>
        </div>
    `;

    // Event Listeners
    document.getElementById('closeDetailBtn').onclick = () => onBack();

    document.getElementById('addContactIssueBtn').onclick = () => {
        const issueData = {
            facility: facility,
            autoOpenModal: true, 
            prefill: {
                initiated_by: contact.Name,
                contact_id: contact.id
            }
        };
        if (window.navigateTo) {
            window.navigateTo('facilityIssues', issueData);
        }
    };

    // Load Avatar Logic
    const images = await getContactImages(contact.id);
    const avatarContainer = document.getElementById('detailAvatarContainer');
    if (avatarContainer) {
        if (images && images.length > 0) {
            const latestImg = images.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            avatarContainer.innerHTML = `<img src="${latestImg.image_url}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid #f5c400; box-shadow:0 4px 10px rgba(0,0,0,0.15);">`;
        } else {
            avatarContainer.innerHTML = `<div style="width:100px; height:100px; border-radius:50%; background:#00264d; color:white; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:bold; margin:0 auto; border:3px solid #f5c400;">${(contact.Name || 'U').charAt(0).toUpperCase()}</div>`;
        }
    }
}
