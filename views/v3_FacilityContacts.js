/* =================================================
FILE: views/v3_FacilityContacts.js
PURPOSE: Render Facility Contacts and Contact Detail View with Clean Direct Routing
UPDATED: 2026-05-29 02:01:02 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';
import { renderImageManagerSection } from '../js/imageManager.js';

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
                File: v3_FacilityContacts.js | Updated: 2026-05-29 02:01:02 PM
            </div>
        </div>
    `;

    const contactsGrid = document.getElementById('contactsGrid');

    const loadContactsGridData = async () => {
        contactsGrid.innerHTML = '';
        
        const { data: contacts, error: contactsError } = await supabase
            .from('CONTACTS')
            .select('*')
            .eq('facility_id', facility?.id);

        const { data: openIssues, error: issuesError } = await supabase
            .from('FACILITY_ISSUES')
            .select('id, initiated_by')
            .eq('open_issue', true)
            .eq('facility_id', facility?.id);

        const { data: allImages } = await supabase
            .from('IMAGES')
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

        if (contactsError) console.error('Contacts fetch error:', contactsError);
        if (issuesError) console.error('Issues fetch error:', issuesError);

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
        const nameVal = document.getElementById('manualContactName').value.trim();
        if (!nameVal) {
            alert("Please enter a name for the contact profile.");
            return;
        }

        const payload = {
            Name: nameVal,
            Role: document.getElementById('manualContactRole').value.trim(),
            Phone: document.getElementById('manualContactPhone').value.trim(),
            Email: document.getElementById('manualContactEmail').value.trim(),
            Notes: document.getElementById('manualContactNotes').value.trim(),
            facility_id: facility.id
        };

        if (activeManualContactId) {
            const { error: updateErr } = await supabase
                .from('CONTACTS')
                .update(payload)
                .eq('id', activeManualContactId);

            if (updateErr) {
                console.error(updateErr);
                alert("Could not update the contact profile row.");
                return;
            }
            document.getElementById('manualContactModal').style.display = 'none';
            await loadContactsGridData();
            return;
        }

        const { data: resultData, error: insertErr } = await supabase
            .from('CONTACTS')
            .insert([payload])
            .select();

        if (insertErr) {
            console.error(insertErr);
            alert("Could not insert the contact profile row.");
            return;
        }

        const newlyCreated = resultData?.[0];
        if (newlyCreated) {
            activeManualContactId = newlyCreated.id;
            
            document.getElementById('manualContactImageSection').style.display = 'block';
            renderImageManagerSection(
                document.getElementById('manualContactImageContainer'),
                'contact',
                activeManualContactId,
                { title: 'Contact Pictures', facility }
            );

            document.getElementById('manualContactSaveBtn').innerText = "DONE";
        }
    };

    document.getElementById('manualContactCloseBtn').onclick = async () => {
        document.getElementById('manualContactModal').style.display = 'none';
        await loadContactsGridData();
    };

    await loadContactsGridData();
}

async function openContactDetail(contact, facility) {
    const app = document.getElementById('app');
    
    const contactName = contact.Name || 'Unnamed';
    const contactRole = contact.Role || '';
    const contactPhone = contact.Phone || '';
    const contactEmail = contact.Email || '';
    const contactNotes = contact.Notes || 'None';

    const { data: totalCountArray } = await supabase
        .from('FACILITY_ISSUES')
        .select('id')
        .eq('facility_id', facility?.id)
        .eq('initiated_by', contactName)
        .eq('open_issue', true);

    const { data: contactImg } = await supabase
        .from('IMAGES')
        .select('public_url')
        .eq('entity_type', 'contact')
        .eq('entity_id', contact.id)
        .order('created_at', { ascending: false })
        .limit(1);

    const issueCount = totalCountArray ? totalCountArray.length : 0;
    const statusColor = issueCount > 0 ? '#ff7b00' : '#4b5563';

    const activeAvatarUrl = contactImg && contactImg.length > 0 ? contactImg[0].public_url : null;
    const avatarHeaderHtml = activeAvatarUrl 
        ? `<img src="${activeAvatarUrl}" style="width:90px; height:90px; border-radius:50%; object-fit:cover; margin:0 auto 15px auto; display:block; border:3px solid #f5c400; box-shadow:0 4px 10px rgba(0,0,0,0.15);" alt="">`
        : `<div style="width:90px; height:90px; border-radius:50%; background:#00264d; color:white; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:bold; margin:0 auto 15px auto; border:3px solid #f5c400; box-shadow:0 4px 10px rgba(0,0,0,0.15);">${contactName.charAt(0).toUpperCase()}</div>`;

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; min-height:100vh; text-align:center; background:#f3f4f6;">
            
            <div style="background:white; border-radius:14px; max-width:400px; margin:0 auto 25px auto; padding:25px; box-shadow:0 4px 12px rgba(0,0,0,0.08); text-align:center; border-top: 4px solid #f5c400;">
                ${avatarHeaderHtml}
                <h2 style="color:#00264d; margin:0 0 4px 0; font-size:24px;">${contactName}</h2>
                <p style="color:#6b7280; font-weight:bold; margin:0 0 20px 0; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">${contactRole}</p>
                
                <div id="contactImageManager" style="margin:0 auto 20px auto; max-width:100%; display:flex; justify-content:center;"></div>

                <div style="text-align:left; border-top:1px solid #f3f4f6; padding-top:15px; font-size:14px; color:#374151; display:flex; flex-direction:column; gap:10px;">
                    <p style="margin:0;"><strong>Phone:</strong> <a href="tel:${contactPhone}" style="color:#00264d; text-decoration:none; font-weight:500;">${contactPhone || 'N/A'}</a></p>
                    <p style="margin:0;"><strong>Email:</strong> <a href="mailto:${contactEmail}" style="color:#00264d; text-decoration:none; font-weight:500;">${contactEmail || 'N/A'}</a></p>
                    <p style="margin:0; line-height:1.4;"><strong>Notes:</strong> <span style="color:#6b7280;">${contactNotes}</span></p>
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px; max-width:400px; margin:0 auto;">
                <div style="display:flex; gap:10px; width:100%;">
                    <button id="directIssuesPageBtn" style="flex:1; padding:14px; background:${statusColor}; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; position:relative; line-height:1.2; font-size:13px;">
                        SEE RELATED ISSUES 
                        ${issueCount > 0 ? `<span style="background:red; font-size:11px; color:white; border-radius:50%; padding:2px 7px; margin-left:4px; font-weight:bold; display:inline-block; vertical-align:middle;">${issueCount}</span>` : ''}
                    </button>
                    <button id="editContactBtn" style="flex:1; padding:14px; background:#f5c400; color:#00264d; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:13px;">
                        ✏️ EDIT INFO
                    </button>
                </div>
                <button id="backBtn" style="width:100%; padding:14px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px;">
                    BACK TO CONTACTS LIST
                </button>
            </div>

            <div style="margin-top:50px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v3_FacilityContacts.js | Updated: 2026-05-29 02:01:02 PM
            </div>
        </div>
    `;

    const imageMount = document.getElementById('contactImageManager');
    if (imageMount) {
        renderImageManagerSection(imageMount, 'contact', contact.id, { title: 'Contact Image', facility });
    }

    document.getElementById('directIssuesPageBtn').onclick = () => {
        window.navigateTo('facilityIssues', { facility, contact });
    };

    document.getElementById('editContactBtn').onclick = () => {
        document.getElementById('modalTitle').innerText = `Edit ${contactName}`;
        document.getElementById('manualContactName').value = contactName;
        document.getElementById('manualContactRole').value = contactRole;
        document.getElementById('manualContactPhone').value = contactPhone;
        document.getElementById('manualContactEmail').value = contactEmail;
        document.getElementById('manualContactNotes').value = contact.Notes || '';
        
        document.getElementById('manualContactImageSection').style.display = 'block';
        renderImageManagerSection(
            document.getElementById('manualContactImageContainer'),
            'contact',
            contact.id,
            { title: 'Contact Pictures', facility }
        );

        const modalInstance = document.getElementById('manualContactModal');
        if (modalInstance) {
            modalInstance.style.display = 'flex';
            const saveBtn = document.getElementById('manualContactSaveBtn');
            saveBtn.innerText = "UPDATE DETAILS";
            
            saveBtn.onclick = async () => {
                const nameVal = document.getElementById('manualContactName').value.trim();
                if (!nameVal) {
                    alert("Name is required.");
                    return;
                }
                const payload = {
                    Name: nameVal,
                    Role: document.getElementById('manualContactRole').value.trim(),
                    Phone: document.getElementById('manualContactPhone').value.trim(),
                    Email: document.getElementById('manualContactEmail').value.trim(),
                    Notes: document.getElementById('manualContactNotes').value.trim()
                };
                const { error } = await supabase.from('CONTACTS').update(payload).eq('id', contact.id);
                if (error) {
                    alert('Error updating contact');
                } else {
                    modalInstance.style.display = 'none';
                    openContactDetail({...contact, ...payload}, facility);
                }
            };
        }
    };

    document.getElementById('backBtn').onclick = () => {
        window.navigateTo('facilityContacts', { facility });
    };
}
