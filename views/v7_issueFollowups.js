/* =================================================
FILE: views/v7_issueFollowups.js
UPDATED: 2026-05-28 10:45:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep the header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';
import { renderImageManagerSection } from '../js/imageManager.js';

export async function renderIssueFollowups(data, issueContext = null) {
    const app = document.getElementById('app');
    if (!app) return;

    // Unpack unified payload container or fallback safely
    const facility = data?.facility ? data.facility : data;
    const issue = data?.issue ? data.issue : issueContext;

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; background:#f3f4f6; min-height:100vh; text-align:center;">
            <h1 style="color:#00264d; font-size:22px;">Issue Follow-ups</h1>
            <p style="color:#4b5563; margin-bottom:25px;">Facility: <strong>${facility?.Name || ''}</strong> | Issue: <strong>${issue?.description || issue?.issue || ''}</strong></p>

            <div style="display:flex; flex-direction:column; gap:12px; max-width:400px; margin:0 auto;">
                <button id="addFollowupBtn" style="padding:15px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">+ ADD FOLLOW-UP</button>
                <button id="backBtn" style="padding:12px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer;">BACK TO ISSUES</button>
                <div id="followupsList" style="margin-top:20px; display:flex; flex-direction:column; gap:12px; text-align:left;">
                    <div style="text-align:center; color:#94a3b8; font-style:italic;">Loading follow-ups...</div>
                </div>
            </div>

            <div id="followupModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:1000; justify-content:center; align-items:center; padding:20px;">
                <div style="background:white; padding:20px; border-radius:12px; width:100%; max-width:450px; text-align:left; max-height:90vh; overflow-y:auto;">
                    <h3 id="modalTitle" style="margin-top:0; color:#00264d; border-bottom:2px solid #f5c400; padding-bottom:10px;">Add Follow-up</h3>
                    <input type="hidden" id="followupId">
                    
                    <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">ACTION TYPE</label>
                    <select id="actionTypeInput" style="width:100%; padding:12px; margin-top:5px; border:1px solid #ccc; border-radius:6px;">
                        <option value="Comment">Comment</option>
                        <option value="Inspection">Inspection</option>
                        <option value="Repair Attempt">Repair Attempt</option>
                        <option value="Resolved">Resolved</option>
                    </select>

                    <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">DESCRIPTION</label>
                    <textarea id="descriptionInput" style="width:100%; padding:12px; margin-top:5px; border:1px solid #ccc; border-radius:6px; min-height:80px;" placeholder="What was done?"></textarea>

                    <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">ACTION BY</label>
                    <input type="text" id="actionByInput" style="width:100%; padding:12px; margin-top:5px; border:1px solid #ccc; border-radius:6px;" placeholder="Your Name">

                    <div id="followup-image-section" style="display:none; margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                        <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-bottom:10px;">FOLLOW-UP PHOTOS</label>
                        <div id="followup-image-container"></div>
                    </div>

                    <div style="display:flex; gap:10px; margin-top:25px;">
                        <button id="saveFollowupBtn" style="flex:1; padding:15px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">SAVE</button>
                        <button id="closeFollowupModal" style="flex:1; padding:15px; background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer;">CLOSE</button>
                    </div>
                </div>
            </div>

            <div style="margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v7_issueFollowups.js | Updated: 2026-05-28 10:45:00 PM
            </div>
        </div>
    `;

    const loadFollowups = async () => {
        if (!issue?.id) return;
        const { data: dbData, error } = await supabase.from('ISSUE_FOLLOWUPS')
            .select('*')
            .eq('issue_id', issue.id)
            .order('timestamp', { ascending: false });

        if (error) { console.error(error); return; }

        const list = document.getElementById('followupsList');
        list.innerHTML = dbData && dbData.length ? dbData.map(item => `
            <div style="background:white; padding:15px; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,0.05); cursor:pointer;" id="followup-item-${item.id}">
                <div style="display:flex; justify-content:between; align-items:center;">
                    <span style="background:#00264d; color:white; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:bold;">${item.action_type}</span>
                    <span style="font-size:10px; color:#94a3b8;">${new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <p style="margin:8px 0 4px 0; color:#333;">${item.description}</p>
                <div style="font-size:11px; color:#64748b;">By: ${item.action_by || 'Unknown'}</div>
            </div>
        `).join('') : '<div style="text-align:center; color:#94a3b8; font-style:italic;">No follow-up logs submitted yet.</div>';

        if (dbData) {
            dbData.forEach(item => {
                const el = document.getElementById(`followup-item-${item.id}`);
                if (el) el.onclick = () => editFollowup(item);
            });
        }
    };

    const editFollowup = (item) => {
        document.getElementById('followupId').value = item.id;
        document.getElementById('actionTypeInput').value = item.action_type;
        document.getElementById('descriptionInput').value = item.description;
        document.getElementById('actionByInput').value = item.action_by;
        document.getElementById('modalTitle').innerText = "Edit Follow-up";

        document.getElementById('followup-image-section').style.display = 'block';
        renderImageManagerSection(document.getElementById('followup-image-container'), 'followup', item.id, { facility, title: 'Follow-up Photos' });

        document.getElementById('followupModal').style.display = 'flex';
    };

    document.getElementById('addFollowupBtn').onclick = () => {
        document.getElementById('followupId').value = '';
        document.getElementById('actionTypeInput').value = 'Comment';
        document.getElementById('descriptionInput').value = '';
        document.getElementById('actionByInput').value = '';
        document.getElementById('modalTitle').innerText = "Add Follow-up";
        document.getElementById('followup-image-section').style.display = 'none';
        document.getElementById('followup-image-container').innerHTML = '';
        document.getElementById('followupModal').style.display = 'flex';
    };

    document.getElementById('saveFollowupBtn').onclick = async () => {
        const id = document.getElementById('followupId').value;
        const payload = {
            issue_id: issue.id,
            action_type: document.getElementById('actionTypeInput').value,
            description: document.getElementById('descriptionInput').value,
            action_by: document.getElementById('actionByInput').value,
            timestamp: new Date()
        };

        if (!payload.description) { alert("Description is required."); return; }

        let result;
        if (id) {
            result = await supabase.from('ISSUE_FOLLOWUPS').update(payload).eq('id', id).select();
        } else {
            result = await supabase.from('ISSUE_FOLLOWUPS').insert([payload]).select();
        }

        if (result.error) {
            console.error("Error saving follow-up:", result.error);
            alert("Error saving follow-up");
        } else {
            const savedItem = result.data[0];
            if (savedItem) {
                document.getElementById('followupId').value = savedItem.id;
                document.getElementById('followup-image-section').style.display = 'block';
                renderImageManagerSection(document.getElementById('followup-image-container'), 'followup', savedItem.id, { facility, title: 'Follow-up Photos' });
            }
        }
    };

    document.getElementById('closeFollowupModal').onclick = () => {
        document.getElementById('followupModal').style.display = 'none';
        loadFollowups();
    };

    document.getElementById('backBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('facilityIssues', { facility });
    };

    await loadFollowups();
}
