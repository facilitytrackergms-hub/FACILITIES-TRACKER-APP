/* =================================================
FILE: views/v3_FacilityContacts.js
PURPOSE: Render Facility Contacts and Contact Detail View with Unified Payload Routing
UPDATED: 2026-05-29 06:02:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';
import { renderImageManagerSection } from '../js/imageManager.js';

export async function renderContacts(data) {
    const app = document.getElementById('app');
    if (!app) return;

    // Unpack unified payload container or fallback
    const facility = data?.facility ? data.facility : data;
    const initialContact = data?.contact ? data.contact : null;

    if (initialContact) {
        return openContactDetail(initialContact, facility);
    }

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; text-align:center; background:#f3f4f6;">
            <h1 style="font-size:22px; margin-bottom:20px; color:#111827;">${facility?.Name || 'FACILITY'} CONTACTS</h1>
            <div id="contactsGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:15px;"></div>

            <div style="margin-top:30px;">
                <button id="backBtn" style="padding:12px 18px; border:none; border-radius:8px; background:#6b7280; color:white; cursor:pointer;">Back to Facility</button>
            </div>

            <div style="margin-top:50px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v3_FacilityContacts.js | Updated: 2026-05-29 06:02:00 AM
            </div>
        </div>
    `;

    const contactsGrid = document.getElementById('contactsGrid');

    const { data: contacts, error: contactsError } = await supabase
        .from('CONTACTS')
        .select('*')
        .eq('facility_id', facility?.id);

    const { data: openIssues, error: issuesError } = await supabase
        .from('FACILITY_PROJECT_ISSUES')
        .select('id, contact_id')
        .eq('open_issue', true)
        .eq('project_id', facility?.id);

    const issuesCountMap = {};
    if (openIssues) {
        openIssues.forEach(issue => {
            if (issue.contact_id) {
                issuesCountMap[issue.contact_id] = (issuesCountMap[issue.contact_id] || 0) + 1;
            }
        });
    }

    if (contactsError) console.error('Contacts fetch error:', contactsError);
    if (issuesError) console.error('Issues fetch error:', issuesError);

    if (contacts) {
        contacts.forEach(contact => {
            const btn = document.createElement('button');
            btn.style.padding = '16px';
            btn.style.borderRadius = '12px';
            btn.style.background = '#f5c400';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.style.position = 'relative';
            
            // Fixed casing from database payload matching
            const nameDisplay = contact.Name || contact.name || 'Unnamed';
            const roleDisplay = contact.Role || contact.role || '';

            btn.innerHTML = `
                ${nameDisplay}<br>
                <span style="font-size:12px;">${roleDisplay}</span>
                ${issuesCountMap[contact.id] ? `<span style="position:absolute; top:6px; right:6px; background:red; color:white; font-size:10px; padding:2px 6px; border-radius:8px;">${issuesCountMap[contact.id]}</span>` : ''}
            `;
            btn.onclick = () => openContactDetail(contact, facility);
            contactsGrid.appendChild(btn);
        });
    }

    document.getElementById('backBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('facilityControls', { facility });
    };
}

async function openContactDetail(contact, facility) {
    const app = document.getElementById('app');
    
    // Fixed casing from database payload matching
    const contactName = contact.Name || contact.name || 'Unnamed';
    const contactRole = contact.Role || contact.role || '';
    const contactPhone = contact.Phone || contact.phone || '';
    const contactEmail = contact.Email || contact.email || '';
    const contactNotes = contact.Notes || contact.notes || 'None';

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; text-align:center; background:#f3f4f6;">
            <h2>${contactName} - ${contactRole}</h2>
            <p>Phone: <a href="tel:${contactPhone}">${contactPhone}</a></p>
            <p>Email: <a href="mailto:${contactEmail}">${contactEmail}</a></p>
            <p>Notes: ${contactNotes}</p>

            <div id="contactImageManager" style="margin:20px auto;"></div>

            <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:20px;">
                <button id="addIssueBtn" style="padding:12px 16px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer;">Add New Issue</button>
                <button id="backBtn" style="padding:12px 16px; background:#6b7280; color:white; border:none; border-radius:8px; cursor:pointer;">Back to Contacts</button>
            </div>

            <div style="margin-top:50px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v3_FacilityContacts.js | Updated: 2026-05-29 06:02:00 AM
            </div>
        </div>
    `;

    const imageMount = document.getElementById('contactImageManager');
    if (imageMount) {
        renderImageManagerSection(imageMount, 'contact', contact.id, { title: 'Contact Image', facility });
    }

    document.getElementById('backBtn').onclick = () => {
        window.navigateTo('facilityContacts', { facility });
    };

    document.getElementById('addIssueBtn').onclick = () => {
        window.navigateTo('pendingProjects', { facility, contact });
    };
}
