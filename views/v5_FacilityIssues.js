/* =================================================
FILE: views/v5_FacilityIssues.js
UPDATED: 2026-05-29
================================================= */

import { supabase } from '../js/supabaseClient.js';
import { renderImageManagerSection } from '../js/imageManager.js';

export async function renderFacilityIssues(data) {
    const facility = data?.facility ? data.facility : data;
    const contact = data?.contact ? data.contact : null;
    
    // Check if we are coming from the "Add Issue For This Contact" button
    const autoOpen = data?.autoOpenModal || false;
    const prefillData = data?.prefill || null;

    if (!facility || !facility.id) {
        console.error("Facility object is missing or invalid");
        return;
    }

    let activeFacilityContacts = [];

    const app = document.getElementById('app');

    app.innerHTML = `
        <div style="padding:20px;font-family:Arial;background:#f3f4f6;min-height:100vh;text-align:center;">
            <h1 style="color:#00264d;font-size:22px;text-transform:uppercase;">Standard Facility Issues</h1>
            <p style="color:#4b5563;margin-bottom:25px;">${facility.Name}</p>

            <div style="display:flex;flex-direction:column;gap:15px;max-width:400px;margin:0 auto;">
                <button id="createNewIssueBtn" style="padding:15px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">+ REPORT NEW ISSUE</button>
                <button id="backToControlsBtn" style="padding:12px;background:#00264d;color:white;border:none;border-radius:8px;cursor:pointer;">BACK TO CONTROLS</button>
                <div id="issuesList" style="margin-top:20px;display:flex;flex-direction:column;gap:12px;text-align:left;">
                    <div style="text-align:center;color:#94a3b8;font-style:italic;">Loading issues...</div>
                </div>
            </div>

            <div id="issueModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;justify-content:center;align-items:center;padding:20px;">
                <div style="background:white;padding:20px;border-radius:12px;width:100%;max-width:450px;text-align:left;max-height:90vh;overflow-y:auto;">
                    <h3 id="modalTitle" style="margin-top:0;color:#00264d;border-bottom:2px solid #f5c400;padding-bottom:10px;">Report Issue</h3>
                    <input type="hidden" id="issueId">
                    <div id="issue-form-fields">
                        <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-top:15px;">ISSUE DESCRIPTION</label>
                        <input type="text" id="issueInput" style="width:100%;padding:12px;margin-top:5px;border:1px solid #ccc;border-radius:6px;" placeholder="What is the problem?">
                        
                        <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-top:15px;">TOOL REQUIRED</label>
                        <input type="text" id="toolInput" style="width:100%;padding:12px;margin-top:5px;border:1px solid #ccc;border-radius:6px;" placeholder="e.g. Ladder, Drill">
                        
                        <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-top:15px;">INITIATED BY</label>
                        <input type="text" id="initiatedByInput" list="contactsDatalist" style="width:100%;padding:12px;margin-top:5px;border:1px solid #ccc;border-radius:6px;" placeholder="Your Name or Select Contact">
                        <datalist id="contactsDatalist"></datalist>

                        <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-top:15px;">NOTES</label>
                        <textarea id="notesInput" style="width:100%;padding:12px;margin-top:5px;border:1px solid #ccc;border-radius:6px;min-height:80px;" placeholder="Additional context..."></textarea>
                    </div>

                    <div id="issue-image-section" style="display:none;margin-top:20px;border-top:1px solid #eee;padding-top:15px;">
                        <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-bottom:10px;">ISSUE PHOTOS</label>
                        <div id="issue-image-container"></div>
                    </div>

                    <div style="display:flex;gap:10px;margin-top:25px;">
                        <button id="saveIssueBtn" style="flex:1;padding:15px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">SAVE ISSUE</button>
                        <button id="closeIssueModal" style="flex:1;padding:15px;background:#eee;color:#333;border:none;border-radius:8px;cursor:pointer;">CLOSE</button>
                    </div>
                </div>
            </div>

            <div id="customDialogModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;justify-content:center;align-items:center;padding:20px;">
                <div style="background:white;padding:25px;border-radius:12px;width:100%;max-width:400px;text-align:center;box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                    <div id="customDialogIcon" style="font-size:40px;margin-bottom:15px;">⚠️</div>
                    <h3 id="customDialogTitle" style="margin:0 0 10px 0;color:#00264d;font-size:18px;">Notification</h3>
                    <p id="customDialogMessage" style="color:#4b5563;font-size:14px;margin:0 0 25px 0;line-height:1.5;"></p>
                    <div id="customDialogButtons" style="display:flex;gap:12px;justify-content:center;">
                        <button id="customDialogConfirmBtn" style="padding:12px 24px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;min-width:100px;">YES</button>
                        <button id="customDialogCancelBtn" style="padding:12px 24px;background:#6b7280;color:white;border:none;border-radius:8px;cursor:pointer;min-width:100px;">NO</button>
                    </div>
                </div>
            </div>

            <div id="quickContactModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2500;justify-content:center;align-items:center;padding:20px;">
                <div style="background:white;padding:25px;border-radius:12px;width:100%;max-width:420px;text-align:left;box-shadow:0 4px 15px rgba(0,0,0,0.3);max-height:90vh;overflow-y:auto;">
                    <h3 style="margin-top:0;color:#00264d;border-bottom:2px solid #f5c400;padding-bottom:10px;">Add Contact Details</h3>
                    
                    <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-top:15px;">NAME</label>
                    <input type="text" id="quickContactName" style="width:100%;padding:10px;margin-top:5px;border:1px solid #ccc;border-radius:6px;background:#f3f4f6;" readonly>
                    
                    <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-top:15px;">ROLE</label>
                    <input type="text" id="quickContactRole" style="width:100%;padding:10px;margin-top:5px;border:1px solid #ccc;border-radius:6px;" placeholder="e.g. Tenant, Driver, Owner">
                    
                    <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-top:15px;">PHONE</label>
                    <input type="text" id="quickContactPhone" style="width:100%;padding:10px;margin-top:5px;border:1px solid #ccc;border-radius:6px;" placeholder="Phone Number">
                    
                    <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-top:15px;">EMAIL</label>
                    <input type="email" id="quickContactEmail" style="width:100%;padding:10px;margin-top:5px;border:1px solid #ccc;border-radius:6px;" placeholder="Email Address">
                    
                    <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-top:15px;">NOTES</label>
                    <textarea id="quickContactNotes" style="width:100%;padding:10px;margin-top:5px;border:1px solid #ccc;border-radius:6px;min-height:60px;" placeholder="Extra notes..."></textarea>
                    
                    <div id="quickContactImageSection" style="display:none;margin-top:20px;border-top:1px solid #eee;padding-top:15px;">
                        <label style="display:block;font-size:12px;font-weight:bold;color:#666;margin-bottom:10px;">CONTACT PICTURE / IMAGES</label>
                        <div id="quickContactImageContainer"></div>
                    </div>
                    
                    <div style="display:flex;gap:10px;margin-top:25px;">
                        <button id="quickContactSaveBtn" style="flex:1;padding:12px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">SAVE CONTACT</button>
                        <button id="quickContactCancelBtn" style="flex:1;padding:12px;background:#eee;color:#333;border:none;border-radius:8px;cursor:pointer;">SKIP DETAILS</button>
                    </div>
                </div>
            </div>
            
        </div>
    `;

    // ... Helper functions (showCustomAlert, showCustomConfirm, promptForContactDetails)
    const showCustomAlert = (title, message, icon = '⚠️') => {
        document.getElementById('customDialogIcon').innerText = icon;
        document.getElementById('customDialogTitle').innerText = title;
        document.getElementById('customDialogMessage').innerText = message;
        document.getElementById('customDialogConfirmBtn').innerText = "OK";
        document.getElementById('customDialogCancelBtn').style.display = 'none';
        document.getElementById('customDialogModal').style.display = 'flex';
        return new Promise((resolve) => {
            document.getElementById('customDialogConfirmBtn').onclick = () => {
                document.getElementById('customDialogModal').style.display = 'none';
                resolve(true);
            };
        });
    };

    const showCustomConfirm = (title, message, icon = '❓') => {
        document.getElementById('customDialogIcon').innerText = icon;
        document.getElementById('customDialogTitle').innerText = title;
        document.getElementById('customDialogMessage').innerText = message;
        document.getElementById('customDialogConfirmBtn').innerText = "YES";
        document.getElementById('customDialogCancelBtn').innerText = "NO";
        document.getElementById('customDialogCancelBtn').style.display = 'block';
        document.getElementById('customDialogModal').style.display = 'flex';
        return new Promise((resolve) => {
            document.getElementById('customDialogConfirmBtn').onclick = () => {
                document.getElementById('customDialogModal').style.display = 'none';
                resolve(true);
            };
            document.getElementById('customDialogCancelBtn').onclick = () => {
                document.getElementById('customDialogModal').style.display = 'none';
                resolve(false);
            };
        });
    };

    const promptForContactDetails = (targetName) => {
        document.getElementById('quickContactName').value = targetName;
        document.getElementById('quickContactRole').value = '';
        document.getElementById('quickContactPhone').value = '';
        document.getElementById('quickContactEmail').value = '';
        document.getElementById('quickContactNotes').value = '';
        document.getElementById('quickContactImageSection').style.display = 'none';
        document.getElementById('quickContactImageContainer').innerHTML = '';
        document.getElementById('quickContactSaveBtn').innerText = "SAVE CONTACT";
        document.getElementById('quickContactCancelBtn').innerText = "SKIP DETAILS";
        document.getElementById('quickContactModal').style.display = 'flex';
        let activeContactId = null;
        return new Promise((resolve) => {
            document.getElementById('quickContactSaveBtn').onclick = async () => {
                if (activeContactId) {
                    document.getElementById('quickContactModal').style.display = 'none';
                    resolve(true);
                    return;
                }
                const contactPayload = {
                    Name: targetName,
                    Role: document.getElementById('quickContactRole').value.trim(),
                    Phone: document.getElementById('quickContactPhone').value.trim(),
                    Email: document.getElementById('quickContactEmail').value.trim(),
                    Notes: document.getElementById('quickContactNotes').value.trim(),
                    facility_id: facility.id
                };
                const { data: insertData, error: insertErr } = await supabase.from('CONTACTS').insert([contactPayload]).select();
                if (insertErr) {
                    await showCustomAlert("Sync Error", "Failed to save the additional contact fields.", "❌");
                    document.getElementById('quickContactModal').style.display = 'none';
                    resolve(true);
                    return;
                }
                const savedContact = insertData?.[0];
                if (savedContact) {
                    activeContactId = savedContact.id;
                    document.getElementById('quickContactImageSection').style.display = 'block';
                    renderImageManagerSection(document.getElementById('quickContactImageContainer'), 'contact', activeContactId, { title: 'Contact Images', facility });
                    document.getElementById('quickContactSaveBtn').innerText = "DONE";
                    document.getElementById('quickContactCancelBtn').style.display = 'none';
                }
            };
            document.getElementById('quickContactCancelBtn').onclick = async () => {
                await supabase.from('CONTACTS').insert([{ Name: targetName, facility_id: facility.id }]);
                document.getElementById('quickContactModal').style.display = 'none';
                resolve(true);
            };
        });
    };

    const loadFacilityContacts = async () => {
        const { data: contactsData } = await supabase.from('CONTACTS').select('*').eq('facility_id', facility.id);
        activeFacilityContacts = contactsData || [];
        const datalist = document.getElementById('contactsDatalist');
        if (datalist) {
            datalist.innerHTML = activeFacilityContacts.map(c => `<option value="${c.Name || ''}"></option>`).join('');
        }
    };

    const loadIssues = async () => {
        await loadFacilityContacts();
        const { data: dbData } = await supabase.from('FACILITY_ISSUES').select('*').eq('facility_id', facility.id).order('created_at', { ascending: false });
        const list = document.getElementById('issuesList');
        if (!dbData || !dbData.length) {
            list.innerHTML = '<div style="text-align:center;color:#94a3b8;font-style:italic;">No active standard issues reported yet.</div>';
            return;
        }
        let cardsHtml = '';
        for (const item of dbData) {
            const matchedContact = activeFacilityContacts.find(c => (c.Name || '').toLowerCase() === (item.initiated_by || '').toLowerCase());
            let avatarMarkup = `<div style="width:40px;height:40px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:18px;color:#94a3b8;font-weight:bold;flex-shrink:0;">👤</div>`;
            if (matchedContact) {
                const { data: fileList } = await supabase.storage.from('facility-images').list(`contact/${matchedContact.id}`);
                if (fileList && fileList.length > 0) {
                    const targetFile = fileList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0].name;
                    const { data: publicUrlData } = supabase.storage.from('facility-images').getPublicUrl(`contact/${matchedContact.id}/${targetFile}`);
                    if (publicUrlData?.publicUrl) avatarMarkup = `<img src="${publicUrlData.publicUrl}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid #d1d5db;" />`;
                }
            }
            cardsHtml += `
                <div class="issue-card" style="background:white;padding:15px;border-radius:10px;border-left:5px solid ${item.open_issue ? '#dc2625':'#28a745'};cursor:pointer;display:flex;align-items:center;gap:12px;" id="facility-issue-item-${item.id}">
                    ${avatarMarkup}
                    <div style="flex:1;">
                        <strong style="display:block;color:#00264d;font-size:15px;">${item.issue}</strong>
                        <span style="font-size:12px;color:#6b7280;">By: ${item.initiated_by || 'Unknown'}</span>
                    </div>
                    <span style="font-size:10px;color:#94a3b8;white-space:nowrap;">${new Date(item.created_at).toLocaleDateString()}</span>
                </div>`;
        }
        list.innerHTML = cardsHtml;
        dbData.forEach(item => {
            const el = document.getElementById(`facility-issue-item-${item.id}`);
            if (el) el.onclick = () => window.editIssue(item);
        });
    };

    window.editIssue = async (item) => {
        await loadFacilityContacts();
        document.getElementById('issueId').value = item.id;
        document.getElementById('issueInput').value = item.issue;
        document.getElementById('toolInput').value = item.tool_required;
        document.getElementById('initiatedByInput').value = item.initiated_by;
        document.getElementById('notesInput').value = item.notes;
        document.getElementById('modalTitle').innerText = "Edit Issue";
        document.getElementById('saveIssueBtn').innerText = "UPDATE INFO";
        document.getElementById('issue-image-section').style.display = 'block';
        renderImageManagerSection(document.getElementById('issue-image-container'), 'issue', item.id, { facility, title:'Issue Photos' });
        document.getElementById('issueModal').style.display = 'flex';
    };

    // Standard Create Logic
    document.getElementById('createNewIssueBtn').onclick = async () => {
        await loadFacilityContacts();
        openBlankModal();
    };

    const openBlankModal = (prefillName = '') => {
        document.getElementById('issueId').value = '';
        document.getElementById('issueInput').value = '';
        document.getElementById('toolInput').value = '';
        document.getElementById('initiatedByInput').value = prefillName || (contact ? (contact.Name || contact.name || '') : '');
        document.getElementById('notesInput').value = '';
        document.getElementById('modalTitle').innerText = "Report Issue";
        document.getElementById('saveIssueBtn').innerText = "SAVE ISSUE";
        document.getElementById('issue-image-section').style.display = 'none';
        document.getElementById('issue-image-container').innerHTML = '';
        document.getElementById('issueModal').style.display = 'flex';
    };

    document.getElementById('saveIssueBtn').onclick = async () => {
        const id = document.getElementById('issueId').value;
        const initiatedByName = document.getElementById('initiatedByInput').value.trim();
        const payload = {
            issue: document.getElementById('issueInput').value,
            tool_required: document.getElementById('toolInput').value,
            initiated_by: initiatedByName,
            notes: document.getElementById('notesInput').value,
            facility_id: facility.id, 
            open_issue: true
        };
        if (!payload.issue) return await showCustomAlert("Missing Description", "Please describe the problem before saving.", "📋");

        if (initiatedByName) {
            const contactExists = activeFacilityContacts.some(c => (c.Name || '').toLowerCase() === initiatedByName.toLowerCase());
            if (!contactExists) {
                const confirmAdd = await showCustomConfirm("New Contact Detected", `The initiator "${initiatedByName}" is not in your contacts list. Add them?`, "👤");
                if (confirmAdd) {
                    await promptForContactDetails(initiatedByName);
                    await loadFacilityContacts();
                }
            }
        }
        let result = !id ? await supabase.from('FACILITY_ISSUES').insert([payload]).select() : await supabase.from('FACILITY_ISSUES').update(payload).eq('id', id).select();
        if (result.error) return await showCustomAlert("Error Saving", "Could not sync layout fields.", "❌");
        const savedItem = result.data[0];
        if (savedItem) {
            document.getElementById('issueId').value = savedItem.id;
            document.getElementById('saveIssueBtn').innerText = "UPDATE INFO";
            document.getElementById('issue-image-section').style.display = 'block';
            renderImageManagerSection(document.getElementById('issue-image-container'), 'issue', savedItem.id, { facility, title:'Issue Photos' });
            await showCustomAlert("Success", "Issue updated successfully!", "✅");
        }
    };

    document.getElementById('closeIssueModal').onclick = () => {
        document.getElementById('issueModal').style.display = 'none';
        loadIssues();
    };

    document.getElementById('backToControlsBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('facilityControls', facility);
    };

    // RUN ON LOAD
    await loadIssues();

    // TRIGGER AUTO-OPEN IF FLAG IS SET
    if (autoOpen && prefillData) {
        openBlankModal(prefillData.initiated_by);
    }
}
