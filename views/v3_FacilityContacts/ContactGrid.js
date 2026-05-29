/* =================================================
FILE: views/v3_FacilityContacts/v3_ContactGrid.js
PURPOSE: Render the Grid of Contact Cards with Issue Badges
UPDATED: 2026-05-29 06:50:00 PM
================================================= */

import { getContactsGridData } from './v3_ContactData.js';

/**
 * Generates the HTML for the contacts grid and attaches click events
 */
export async function renderContactGrid(container, facility, onContactClick) {
    container.innerHTML = '<div style="color:#6b7280; padding:20px;">Loading contacts...</div>';

    // Fetch data using our new Data Service
    const { contacts, openIssues, allImages } = await getContactsGridData(facility.id);

    // Map images and issues for quick lookup
    const imageMap = {};
    if (allImages) {
        allImages.forEach(img => {
            if (!imageMap[img.related_id] || new Date(img.created_at) > new Date(imageMap[img.related_id].created_at)) {
                imageMap[img.related_id] = img;
            }
        });
    }

    const issuesCountMap = {};
    if (openIssues) {
        openIssues.forEach(issue => {
            if (issue.initiated_by) {
                const normKey = issue.initiated_by.toLowerCase().trim();
                issuesCountMap[normKey] = (issuesCountMap[normKey] || 0) + 1;
            }
        });
    }

    container.innerHTML = ''; // Clear loader

    if (!contacts || contacts.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; color:#94a3b8; font-style:italic; padding:20px;">No contacts found.</div>`;
        return;
    }

    // Build the Grid
    contacts.forEach(contact => {
        const btn = document.createElement('button');
        btn.style.cssText = "padding:16px; border-radius:12px; background:#f5c400; border:none; cursor:pointer; font-weight:bold; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;";
        
        const nameDisplay = contact.Name || 'Unnamed';
        const roleDisplay = contact.Role || '';
        const pendingCount = issuesCountMap[nameDisplay.toLowerCase().trim()] || 0;
        const contactImg = imageMap[contact.id];

        const avatarHtml = contactImg && contactImg.image_url 
            ? `<img src="${contactImg.image_url}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.15);">`
            : `<div style="width:50px; height:50px; border-radius:50%; background:#00264d; color:white; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.15);">${nameDisplay.charAt(0).toUpperCase()}</div>`;

        btn.innerHTML = `
            ${avatarHtml}
            <div style="text-align:center; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <span style="color:#00264d; display:block;">${nameDisplay}</span>
                <span style="font-size:12px; font-weight:normal; color:#1e293b; display:block;">${roleDisplay}</span>
            </div>
            ${pendingCount ? `<span style="position:absolute; top:6px; right:6px; background:#dc2626; color:white; font-size:10px; padding:2px 6px; border-radius:8px;">${pendingCount}</span>` : ''}
        `;

        btn.onclick = () => onContactClick(contact);
        container.appendChild(btn);
    });
}
