/* =================================================
FILE: views/v5_FacilityIssues.js
UPDATED: 2026-05-29 05:30:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';
import { renderImageManagerSection } from '../js/imageManager.js';

export async function renderFacilityIssues(data) {
    const facility = data?.facility ? data.facility : data;
    const contact = data?.contact ? data.contact : null;

    if (!facility || !facility.id) {
        console.error("Facility object is missing or invalid");
        return;
    }

    let activeFacilityContacts = [];

    const app = document.getElementById('app');

    app.innerHTML = `
        <div style="padding:20px;font-family:Arial;background:#f3f4f6;min-height:100vh;text-align:center;">
            <h1 style="color:#00264d;font-size:22px;text-transform:uppercase;">Facility Issues</h1>
            <p style="color:#4b5563;margin-bottom:25px;">${facility.Name}</p>

            <div style="display:flex;flex-direction:column;gap:15px;max-width:400px;margin:0 auto;">
                <button id="createNewIssueBtn" style="padding:15px;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">+ REPORT NEW ISSUE</button>
                <button id="backToProjects" style="padding:12px;background:#00264d;color:white;border:none;border-radius:8px;cursor:pointer;">BACK TO PROJECTS</button>
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
            
            <div style="margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v5_FacilityIssues.js | Updated: 2026-05-29 05:30:00 AM
            </div>
        </div>
    `;

    const loadFacilityContacts = async () => {
        const { data: contactsData, error } = await supabase
            .from('CONTACTS')
            .select('*')
            .eq('facility_id', facility.id);
        
        if (error) {
            console.error("Error loading contacts for combo box:", error);
            return;
        }

        activeFacilityContacts = contactsData || [];
        const datalist = document.getElementById('contactsDatalist');
        if (datalist) {
            datalist.innerHTML = activeFacilityContacts
                .map(c => {
                    const nameVal = c.name || c.Name || '';
                    return `<option value="${nameVal}"></option>`;
                })
                .join('');
        }
    };

    const loadIssues = async () => {
        const { data: dbData, error } = await supabase.from('FACILITY_ISSUES')
            .select('*')
            .eq('facility_id', facility.id)
            .order('created_at', { ascending: false });
        if (error) { console.error(error); return; }

        const list = document.getElementById('issuesList');
        list.innerHTML = dbData && dbData.length ? dbData.map(item => `
            <div class="issue-card" style="background:white;padding:15px;border-radius:10px;border-left:5px solid ${item.open_issue ? '#dc2625':'#28a745'};cursor:pointer;"
                id="facility-issue-item-${item.id}">
                <strong style="color:#00264d;">${item.issue}</strong>
                <span style="font-size:10px;color:#94a3b8;">${new Date(item.created_at).toLocaleDateString()}</span>
            </div>
        `).join('') : '<div style="text-align:center;color:#94a3b8;font-style:italic;">No issues reported yet.</div>';

        if (dbData) {
            dbData.forEach(item => {
                const el = document.getElementById(`facility-issue-item-${item.id}`);
                if (el) el.onclick = () => window.editIssue(item);
            });
        }
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

    document.getElementById('createNewIssueBtn').onclick = async () => {
        await loadFacilityContacts();
        document.getElementById('issueId').value = '';
        document.getElementById('issueInput').value = '';
        document.getElementById('toolInput').value = '';
        const defaultName = contact ? (contact.name || contact.Name || '') : '';
        document.getElementById('initiatedByInput').value = defaultName;
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

        if (!payload.issue) return alert("Please describe the issue.");

        if (initiatedByName) {
            const contactExists = activeFacilityContacts.some(c => {
                const currentName = c.name || c.Name || '';
                return currentName.toLowerCase() === initiatedByName.toLowerCase();
            });

            if (!contactExists) {
                const confirmAdd = confirm(`The initiator "${initiatedByName}" is not in your facility contacts list. Do you want to add them as a new contact?`);
                if (confirmAdd) {
                    // Send both lowercase and uppercase variations to stay completely safe against schema cache configurations
                    const newContactPayload = {
                        name: initiatedByName,
                        Name: initiatedByName,
                        facility_id: facility.id
                    };

                    const { error: contactError } = await supabase
                        .from('CONTACTS')
                        .insert([newContactPayload]);
                    
                    if (contactError) {
                        console.error("Error auto-creating new contact:", contactError);
                        alert("Could not create new contact entry due to server cache, but proceeding with issue save.");
                    } else {
                        await loadFacilityContacts();
                    }
                }
            }
        }

        let result;
        if (!id) {
            result = await supabase.from('FACILITY_ISSUES').insert([payload]).select();
        } else {
            result = await supabase.from('FACILITY_ISSUES').update(payload).eq('id', id).select();
        }

        if (result.error) return alert("Error saving issue");

        const savedItem = result.data[0];
        if (savedItem) {
            document.getElementById('issueId').value = savedItem.id;
            document.getElementById('saveIssueBtn').innerText = "UPDATE INFO";
            document.getElementById('issue-image-section').style.display = 'block';
            renderImageManagerSection(document.getElementById('issue-image-container'), 'issue', savedItem.id, { facility, title:'Issue Photos' });
        }
    };

    document.getElementById('closeIssueModal').onclick = () => {
        document.getElementById('issueModal').style.display = 'none';
        loadIssues();
    };

    document.getElementById('backToProjects').onclick = () => {
        if (window.navigateTo) window.navigateTo('pendingProjects', { facility, contact });
    };

    await loadIssues();
}
