/* =================================================
FILE: views/v3_FacilityContacts.js
PURPOSE: Render Facility Contacts and Contact Detail View with avatar on top
UPDATED: 2026-05-29 02:36:55 PM
================================================= */

import { supabase } from '../js/supabaseClient.js';
import { renderImageManagerSection } from '../js/imageManager.js';

export async function openContactDetail(contact, facility) {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; background:#f3f4f6; text-align:center;">
            <div style="max-width:500px; margin:0 auto; background:white; border-radius:12px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05); text-align:left;">
                
                <div style="text-align:center; margin-bottom:20px;" id="detailAvatarContainer"></div>

                <h2 style="margin:0 0 5px 0; color:#00264d; text-align:center;">${contact.Name || 'Unnamed Contact'}</h2>
                <p style="margin:0 0 20px 0; color:#6b7280; text-align:center; font-weight:bold;">${contact.Role || 'No Role Assigned'}</p>

                <hr style="border:0; border-top:1px solid #eee; margin-bottom:20px;">

                <div style="margin-bottom:12px;"><strong>Phone:</strong> ${contact.Phone || 'N/A'}</div>
                <div style="margin-bottom:12px;"><strong>Email:</strong> ${contact.Email || 'N/A'}</div>
                <div style="margin-bottom:20px;"><strong>Notes:</strong> ${contact.Notes || 'None'}</div>

                <div id="contactImageManagerContainer" style="margin-top:20px; border-top:1px solid #eee; padding-top:20px;"></div>

                <div style="margin-top:30px; display:flex; gap:10px;">
                    <button id="closeDetailBtn" style="flex:1; padding:12px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer;">CLOSE DETAILS</button>
                </div>
            </div>
        </div>
    `;

    // Corrected to lowercase 'images' route matching standard Supabase design configurations
    const { data: images } = await supabase
        .from('images')
        .select('*')
        .eq('entity_type', 'contact')
        .eq('entity_id', contact.id);

    const avatarContainer = document.getElementById('detailAvatarContainer');
    
    if (images && images.length > 0) {
        const latestImg = images.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        avatarContainer.innerHTML = `<img src="${latestImg.public_url}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid #f5c400; box-shadow:0 4px 10px rgba(0,0,0,0.15);">`;
    } else {
        avatarContainer.innerHTML = `<div style="width:100px; height:100px; border-radius:50%; background:#00264d; color:white; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:bold; margin:0 auto; border:3px solid #f5c400;">${(contact.Name || 'U').charAt(0).toUpperCase()}</div>`;
    }

    // Defer the image manager invocation until the stack frame finishes layout rendering
    setTimeout(() => {
        const managerContainer = document.getElementById('contactImageManagerContainer');
        if (managerContainer && typeof renderImageManagerSection === 'function') {
            renderImageManagerSection('contact', contact.id, managerContainer);
        }
    }, 0);

    document.getElementById('closeDetailBtn').onclick = () => {
        renderContacts({ facility });
    };
}

export async function renderContacts(data) {
    const app = document.getElementById('app');
    if (!app) return;

    const facility = data?.facility ? data.facility : data;
    const initialContact = data?.contact ? data.contact : null;

    if (initialContact) {
        return openContactDetail(initialContact, facility);
    }

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; text-align:center; background:#f3f4f6;">
            <h1 style="font-size:22px; margin-bottom:5px; color:#00264d; text-transform:uppercase;">${facility?.Name || 'FACILITY'} CONTACTS</h1>
            <p style="color:#6b7280; margin-bottom:20px;">Manage contacts and personnel profiles</p>
            
            <div style="margin-bottom:25px; display:flex; gap:10px; justify-content:center;">
                <button id="addManualContactBtn" style="padding:14px 20px; border:none; border-radius:8px; background:#28a745; color:white; font-weight:bold; cursor:pointer;">+ ADD NEW CONTACT</button>
                <button id="backBtn" style="padding:14px 20px; border:none; border-radius:8px; background:#00264d; color:white; cursor:pointer;">BACK TO DASHBOARD</button>
            </div>

            <div id="contactsGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:15px;"></div>

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
                    
                    <div id="manualContactImageSection" style="display:none; margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                        <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-bottom:10px;">CONTACT PICTURES / ATTACHMENTS</label>
                        <div id="manualContactImageContainer"></div>
                    </div>
                    
                    <div style="display:flex; gap:10px; margin-top:25px;">
                        <button id="manualContactSaveBtn" style="flex:1; padding:13px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">SAVE DETAILS</button>
                        <button id="manualContactCloseBtn" style="flex:1; padding:13px; background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer;">CLOSE</button>
                    </div>
                </div>
            </div>

            <div style="margin-top:50px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v3_FacilityContacts.js | Updated: 2026-05-29 02:36:55 PM
            </div>
        </div>
    `;

    const contactsGrid = document.getElementById('contactsGrid');

    const loadContactsGridData = async () => {
        contactsGrid.innerHTML = '';
        
        const { data: contacts } = await supabase
            .from('CONTACTS')
            .select('*')
            .eq('facility_id', facility?.id);

        const { data: openIssues } = await supabase
            .from('FACILITY_ISSUES')
            .select('id, initiated_by')
            .eq('open_issue', true)
            .eq('facility_id', facility?.id);

        // Updated database target string path down here as well to fix grid loaders
        const { data: allImages } = await supabase
            .from('images')
            .select('*')
            .eq('entity_type', 'contact');

        const imageMap = {};
        if (allImages) {
            allImages.forEach(img => {
                if (!imageMap[img.entity_id] || new Date(img.created_at) > new Date(imageMap[img.entity_id].created_at)) {
                    imageMap[img.entity_id] = img;
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

        if (contacts && contacts.length > 0) {
            contacts.forEach(contact => {
                const btn = document.createElement('button');
                btn.style.padding = '16px';
                btn.style.borderRadius = '12px';
                btn.style.background = '#f5c400';
                btn.style.border = 'none';
                btn.style.cursor = 'pointer';
                btn.style.fontWeight = 'bold';
                btn.style.position = 'relative';
                btn.style.display = 'flex';
                btn.style.flexDirection = 'column';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
                btn.style.gap = '8px';
                
                const nameDisplay = contact.Name || 'Unnamed';
                const roleDisplay = contact.Role || '';
                const normNameKey = nameDisplay.toLowerCase().trim();
                const pendingCount = issuesCountMap[normNameKey] || 0;

                const contactImg = imageMap[contact.id];
                const avatarHtml = contactImg && contactImg.public_url 
                    ? `<img src="${contactImg.public_url}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.15);" alt="">`
                    : `<div style="width:50px; height:50px; border-radius:50%; background:#00264d; color:white; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.15);">${nameDisplay.charAt(0).toUpperCase()}</div>`;

                btn.innerHTML = `
                    ${avatarHtml}
                    <div style="text-align:center; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        <span style="color:#00264d; display:block;">${nameDisplay}</span>
                        <span style="font-size:12px; font-weight:normal; color:#1e293b; display:block;">${roleDisplay}</span>
                    </div>
                    ${pendingCount ? `<span style="position:absolute; top:6px; right:6px; background:#dc2626; color:white; font-size:10px; padding:2px 6px; border-radius:8px;">${pendingCount}</span>` : ''}
                `;
                btn.onclick = () => openContactDetail(contact, facility);
                contactsGrid.appendChild(btn);
            });
        } else {
            contactsGrid.innerHTML = `<div style="grid-column:1/-1; color:#94a3b8; font-style:italic; padding:20px;">No contacts found for this facility. Click "+ ADD NEW CONTACT" to create one.</div>`;
        }
    };

    let activeManualContactId = null;

    document.getElementById('addManualContactBtn').onclick = () => {
        activeManualContactId = null;
        document.getElementById('modalTitle').innerText = "New Contact Profile";
        document.getElementById('manualContactName').value = '';
        document.getElementById('manualContactRole').value = '';
        document.getElementById('manualContactPhone').value = '';
        document.getElementById('manualContactEmail').value = '';
        document.getElementById('manualContactNotes').value = '';
        
        document.getElementById('manualContactImageSection').style.display = 'none';
        document.getElementById('manualContactImageContainer').innerHTML = '';
        
        document.getElementById('manualContactSaveBtn').innerText = "SAVE DETAILS";
        document.getElementById('manualContactModal').style.display = 'flex';
    };

    document.getElementById('manualContactSaveBtn').onclick = async () => {
        const name = document.getElementById('manualContactName').value;
        const role = document.getElementById('manualContactRole').value;
        const phone = document.getElementById('manualContactPhone').value;
        const email = document.getElementById('manualContactEmail').value;
        const notes = document.getElementById('manualContactNotes').value;

        if (!name) return alert('Name is required');

        const contactData = { Name: name, Role: role, Phone: phone, Email: email, Notes: notes, facility_id: facility.id };

        if (activeManualContactId) {
            await supabase.from('CONTACTS').update(contactData).eq('id', activeManualContactId);
        } else {
            await supabase.from('CONTACTS').insert([contactData]);
        }

        document.getElementById('manualContactModal').style.display = 'none';
        await loadContactsGridData();
    };

    document.getElementById('manualContactCloseBtn').onclick = async () => {
        document.getElementById('manualContactModal').style.display = 'none';
        await loadContactsGridData();
    };

    if (document.getElementById('backBtn')) {
        document.getElementById('backBtn').onclick = () => {
            window.location.hash = '#dashboard'; 
        };
    }

    await loadContactsGridData();
}
