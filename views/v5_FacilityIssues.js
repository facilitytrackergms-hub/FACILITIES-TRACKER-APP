/* =================================================
FILE: views/v5_FacilityIssues.js
UPDATED: 2026-05-29 10:45:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.

STRICT FILE RULES:
1. Always output the full, complete file content.
2. NEVER ask the user to "find and replace" or manually edit code.
3. DO NOT change code, logic, or styling unless explicitly requested.
4. Keep the file exactly as it is, only applying the requested updates.
5. WE CANNOT CREATE EMPTY FILES. Validation is required.
6. Always update the visible version tag for every touched view/file, including V1. If any code update affects the app, update the visible bottom version label with the current date, time, and exact file name.
================================================= */

import { supabase } from '../js/supabaseClient.js';
import { renderImageManagerSection } from '../js/imageManager.js';

export async function renderFacilityIssues(facility, contact = null) {
    const app = document.getElementById('app');
    
    // Safety check fallbacks
    const facilityName = facility?.Name || 'Unknown Facility';
    const facilityId = facility?.id || null;
    
    app.innerHTML = `
        <div style="padding: 20px; font-family: Arial; background: #f3f4f6; min-height: 100vh; text-align: center;">
            <h1 style="color: #00264d; font-size: 22px; text-transform: uppercase;">Facility Issues</h1>
            <p style="color: #4b5563; margin-bottom: 25px;">${facilityName}${contact?.name ? ` | Contact: ${contact.name}` : ''}</p>

            <div style="display: flex; flex-direction: column; gap: 15px; max-width: 400px; margin: 0 auto;">
                <button id="createNewIssueBtn" style="padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">+ REPORT NEW ISSUE</button>
                <button id="backToProjects" style="padding: 12px; background: #00264d; color: white; border: none; border-radius: 8px; cursor: pointer;">BACK TO PROJECTS</button>
                
                <div id="issuesList" style="margin-top: 20px; display: flex; flex-direction: column; gap: 12px; text-align: left;">
                    <div style="text-align: center; color: #94a3b8; font-style: italic;">Loading issues...</div>
                </div>
            </div>

            <div id="issueModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center; padding: 20px;">
                <div style="background: white; padding: 20px; border-radius: 12px; width: 100%; max-width: 450px; text-align: left; max-height: 90vh; overflow-y: auto;">
                    <h3 id="modalTitle" style="margin-top: 0; color: #00264d; border-bottom: 2px solid #f5c400; padding-bottom: 10px;">Report Issue</h3>
                    
                    <input type="hidden" id="issueId">
                    
                    <div id="issue-form-fields">
                        <label style="font-size:12px; font-weight:bold; color:#64748b;">ISSUE DESCRIPTION</label>
                        <input type="text" id="issueInput" style="display:block; width:100%; margin:5px 0 15px 0; padding:10px; border:1px solid #ccc; border-radius:5px;">

                        <label style="font-size:12px; font-weight:bold; color:#64748b;">TOOL REQUIRED</label>
                        <input type="text" id="toolInput" style="display:block; width:100%; margin:5px 0 15px 0; padding:10px; border:1px solid #ccc; border-radius:5px;">

                        <label style="font-size:12px; font-weight:bold; color:#64748b;">INITIATED BY</label>
                        <input type="text" id="initiatedByInput" style="display:block; width:100%; margin:5px 0 15px 0; padding:10px; border:1px solid #ccc; border-radius:5px;">

                        <label style="font-size:12px; font-weight:bold; color:#64748b;">NOTES</label>
                        <textarea id="notesInput" style="display:block; width:100%; margin:5px 0 15px 0; padding:10px; border:1px solid #ccc; border-radius:5px; height:60px;"></textarea>
                    </div>

                    <div id="issue-image-section" style="display: none; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
                        <label style="font-size:12px; font-weight:bold; color:#64748b;">ISSUE PHOTOS</label>
                        <div id="issue-image-container"></div>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 25px;">
                        <button id="saveIssueBtn" style="flex:1; padding:15px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer;">SAVE ISSUE</button>
                        <button id="closeIssueModal" style="flex:1; padding:15px; background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer;">CLOSE</button>
                    </div>
                </div>
            </div>

            <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                File: v5_FacilityIssues.js | Updated: 2026-05-29 10:45:00 AM
            </div>
        </div>
    `;

    const loadIssues = async () => {
        if (!facilityId) return;
        const { data, error } = await supabase
            .from('FACILITY_PROJECT_ISSUES')
            .select('*')
            .eq('project_id', facilityId)
            .order('created_at', { ascending: false });

        const list = document.getElementById('issuesList');
        if (error) return;
        if (data && data.length > 0) {
            list.innerHTML = data.map(item => `
                <div class="issue-card" style="background:white; padding:15px; border-radius:10px; border-left:5px solid ${item.open_issue ? '#dc3545':'#28a745'}; cursor:pointer;" onclick='window.editIssue(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:#00264d;">${item.description}</strong>
                        <span style="font-size:10px; color:#94a3b8;">${new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style="font-size:13px; color:#64748b; margin-top:5px;">By: ${item.initiated_by || 'Unknown'}</div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div style="text-align:center; color:#94a3b8; font-style:italic;">No issues reported.</div>';
        }
    };

    window.editIssue = (item) => {
        document.getElementById('issueId').value = item.id;
        document.getElementById('issueInput').value = item.description || '';
        document.getElementById('toolInput').value = item.tool_required || '';
        document.getElementById('initiatedByInput').value = item.initiated_by || '';
        document.getElementById('notesInput').value = item.notes || '';
        document.getElementById('modalTitle').innerText = "Edit Issue";
        document.getElementById('saveIssueBtn').innerText = "UPDATE INFO";

        const imageContainer = document.getElementById('issue-image-container');
        imageContainer.innerHTML = '';
        document.getElementById('issue-image-section').style.display = 'block';
        renderImageManagerSection(imageContainer, 'issue', item.id, { facility, title: 'Issue Photos' });

        document.getElementById('issueModal').style.display = 'flex';
    };

    document.getElementById('createNewIssueBtn').onclick = () => {
        document.getElementById('issueId').value = '';
        document.getElementById('issueInput').value = '';
        document.getElementById('toolInput').value = '';
        document.getElementById('initiatedByInput').value = contact?.name || '';
        document.getElementById('notesInput').value = '';
        document.getElementById('modalTitle').innerText = "Report Issue";
        document.getElementById('saveIssueBtn').innerText = "SAVE ISSUE";
        document.getElementById('issue-image-section').style.display = 'none';
        document.getElementById('issueModal').style.display = 'flex';
    };

    document.getElementById('saveIssueBtn').onclick = async () => {
        const id = document.getElementById('issueId').value;
        const payload = {
            project_id: facilityId,
            contact_id: contact?.id || null,
            description: document.getElementById('issueInput').value,
            tool_required: document.getElementById('toolInput').value,
            initiated_by: document.getElementById('initiatedByInput').value,
            notes: document.getElementById('notesInput').value,
            open_issue: true
        };

        if (!payload.description) {
            alert("Description is required.");
            return;
        }

        let result;
        if (id) {
            result = await supabase.from('FACILITY_PROJECT_ISSUES').update(payload).eq('id', id).select();
        } else {
            result = await supabase.from('FACILITY_PROJECT_ISSUES').insert([payload]).select();
        }

        if (result.error) {
            console.error("Save error:", result.error);
            alert("Save failed: " + result.error.message);
        } else {
            const savedItem = result.data[0];
            if (!id && savedItem) {
                document.getElementById('issueId').value = savedItem.id;
                document.getElementById('issue-image-section').style.display = 'block';
                renderImageManagerSection(document.getElementById('issue-image-container'), 'issue', savedItem.id, { facility, title: 'Issue Photos' });
                document.getElementById('saveIssueBtn').innerText = "UPDATE INFO";
            } else {
                document.getElementById('issueModal').style.display = 'none';
                loadIssues();
            }
        }
    };

    document.getElementById('closeIssueModal').onclick = () => {
        document.getElementById('issueModal').style.display = 'none';
        loadIssues();
    };

    document.getElementById('backToProjects').onclick = () => {
        window.navigateTo('pendingProjects', facility);
    };

    loadIssues();
}
