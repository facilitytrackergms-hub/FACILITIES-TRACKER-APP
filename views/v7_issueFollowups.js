/* =================================================
FILE: views/v7_issueFollowups.js
UPDATED: 2026-05-29 02:40:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep the header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';
import { renderImageManagerSection } from '../js/imageManager.js';

export async function renderIssueFollowups(facility, issue) {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; background:#f3f4f6; min-height:100vh; text-align:center;">
            <h1 style="color:#00264d; font-size:22px;">Issue Follow-ups</h1>
            <p style="color:#4b5563; margin-bottom:25px;">Facility: <strong>${facility.Name}</strong> | Issue: <strong>${issue.description}</strong></p>

            <div style="display:flex; flex-direction:column; gap:12px; max-width:400px; margin:0 auto;">
                <button id="addFollowupBtn" style="padding:15px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">+ ADD FOLLOW-UP</button>
                <button id="backBtn" style="padding:12px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer;">BACK TO ISSUES</button>
                
                <div id="followupsList" style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
                    <div style="text-align:center; color:#94a3b8; font-style:italic;">Loading follow-ups...</div>
                </div>
            </div>

            <div id="followupModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:1000; justify-content:center; align-items:center; padding:20px;">
                <div style="background:white; padding:20px; border-radius:12px; width:100%; max-width:450px; text-align:left; max-height:90vh; overflow-y:auto;">
                    <h3 id="modalTitle" style="margin-top:0; color:#00264d; border-bottom:2px solid #f5c400; padding-bottom:10px;">Add Follow-up</h3>

                    <input type="hidden" id="followupId">

                    <div>
                        <label>ACTION TYPE</label>
                        <input type="text" id="actionTypeInput" placeholder="Status Update, Tool Delivered, Repair Done">

                        <label>DESCRIPTION</label>
                        <textarea id="descriptionInput" placeholder="Describe the follow-up..." style="width:100%; min-height:80px;"></textarea>

                        <label>BY</label>
                        <input type="text" id="actionByInput" placeholder="Staff name">
                    </div>

                    <div id="followupImageSection" style="display:none; margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                        <label>FOLLOW-UP PHOTOS</label>
                        <div id="followupImageContainer"></div>
                    </div>

                    <div style="display:flex; gap:10px; margin-top:25px;">
                        <button id="saveFollowupBtn" style="flex:1; padding:15px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer;">SAVE FOLLOW-UP</button>
                        <button id="closeFollowupModal" style="flex:1; padding:15px; background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer;">CLOSE</button>
                    </div>
                </div>
            </div>

            <div style="margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v7_issueFollowups.js | Updated: 2026-05-29 02:40:00 AM
            </div>
        </div>
    `;

    const followupsList = document.getElementById('followupsList');

    async function loadFollowups() {
        const { data, error } = await supabase
            .from('ISSUE_FOLLOWUPS')
            .select('*')
            .eq('issue_id', issue.id)
            .order('timestamp', { ascending: true });

        if (error) {
            console.error(error);
            followupsList.innerHTML = '<div style="color:red;">Error loading follow-ups.</div>';
            return;
        }

        if (data && data.length > 0) {
            followupsList.innerHTML = data.map(f => `
                <div style="background:white; padding:12px; border-radius:8px; border-left:4px solid #28a745; cursor:pointer;" onclick="window.editFollowup(${JSON.stringify(f).replace(/"/g,'&quot;')})">
                    <strong>${f.action_type || 'Action'}</strong> - ${new Date(f.timestamp).toLocaleDateString()}<br>
                    <span style="color:#64748b; font-size:13px;">By: ${f.action_by || 'Unknown'}</span><br>
                    <span>${f.description}</span>
                </div>
            `).join('');
        } else {
            followupsList.innerHTML = '<div style="text-align:center; color:#94a3b8; font-style:italic;">No follow-ups yet.</div>';
        }
    }

    window.editFollowup = (f) => {
        document.getElementById('followupId').value = f.id;
        document.getElementById('actionTypeInput').value = f.action_type;
        document.getElementById('descriptionInput').value = f.description;
        document.getElementById('actionByInput').value = f.action_by;
        document.getElementById('modalTitle').innerText = "Edit Follow-up";
        document.getElementById('saveFollowupBtn').innerText = "UPDATE FOLLOW-UP";

        document.getElementById('followupImageSection').style.display = 'block';
        document.getElementById('followupImageContainer').innerHTML = '';
        renderImageManagerSection(document.getElementById('followupImageContainer'), 'followup', f.id, {
            facility,
            title: 'Follow-up Photos'
        });

        document.getElementById('followupModal').style.display = 'flex';
    };

    document.getElementById('addFollowupBtn').onclick = () => {
        document.getElementById('followupId').value = '';
        document.getElementById('actionTypeInput').value = '';
        document.getElementById('descriptionInput').value = '';
        document.getElementById('actionByInput').value = '';
        document.getElementById('modalTitle').innerText = "Add Follow-up";
        document.getElementById('saveFollowupBtn').innerText = "SAVE FOLLOW-UP";
        document.getElementById('followupImageSection').style.display = 'none';
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
            document.getElementById('followupModal').style.display = 'none';
            loadFollowups();
        }
    };

    document.getElementById('closeFollowupModal').onclick = () => {
        document.getElementById('followupModal').style.display = 'none';
        loadFollowups();
    };

    document.getElementById('backBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('facilityIssues', facility);
    };

    loadFollowups();
}
