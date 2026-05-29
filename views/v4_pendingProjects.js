/* =================================================
FILE: views/v4_pendingProjects.js
UPDATED: 2026-05-29 09:10:00 PM
================================================= */

import { supabase } from '../js/supabaseClient.js';

export async function renderPendingProjects(data) {
    const app = document.getElementById('app');
    
    // Unpack facility and contact
    const facility = data?.facility ? data.facility : data;
    const contact = data?.contact ? data.contact : null;

    if (!facility || !facility.id) {
        console.error("Invalid facility passed to renderPendingProjects:", facility);
        app.innerHTML = '<div style="text-align:center; color:#dc2625;">Invalid facility object.</div>';
        return;
    }

    const facilityName = facility?.Name || 'Unknown Facility';
    const facilityId = facility?.id;

    app.innerHTML = `
        <div style="padding:40px 20px; text-align:center; font-family:Arial; background:#f3f4f6; min-height:100vh;">
            <h1 style="color:#00264d; margin-bottom:10px;">PENDING PROJECTS</h1>
            <p style="color:#64748b; margin-bottom:30px;">
                Facility: <strong>${facilityName}</strong>
                ${contact?.name ? ` | Contact: <strong>${contact.name}</strong>` : ''}
            </p>

            <div style="display:flex; flex-direction:column; gap:15px; max-width:400px; margin:0 auto;">
                <button id="addNewProjectBtn" style="padding:20px; background:#28a745; color:white; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    ADD NEW ISSUE
                </button>
                
                <div id="pendingProjectsList" style="margin-top:20px; display:flex; flex-direction:column; gap:12px; text-align:left;">
                    <div style="text-align:center; color:#94a3b8; font-style:italic;">Loading active items...</div>
                </div>
                
                <button id="backToHub2" style="padding:15px; background:#00264d; color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold; margin-top:20px;">
                    BACK TO CONTROLS
                </button>
            </div>
            
            <div style="margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v4_pendingProjects.js | Updated: 2026-05-29 09:10:00 PM
            </div>
        </div>
    `;

    const loadPendingItems = async () => {
        const listDiv = document.getElementById('pendingProjectsList');
        if (!facilityId) {
            listDiv.innerHTML = '<div style="text-align:center; color:#94a3b8;">Missing facility reference.</div>';
            return;
        }

        const { data: issues, error } = await supabase
            .from('FACILITY_PROJECT_ISSUES')
            .select('*')
            .eq('project_id', facilityId)
            .eq('open_issue', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            listDiv.innerHTML = '<div style="text-align:center; color:#dc2625;">Error loading tracking data.</div>';
            return;
        }

        if (issues && issues.length > 0) {
            listDiv.innerHTML = issues.map(item => `
                <div style="background:white; padding:15px; border-radius:10px; border-left:5px solid #dc2625; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.05);" 
                     id="issue-card-${item.id}">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:#00264d;">${item.description}</strong>
                        <span style="font-size:10px; color:#94a3b8;">${new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style="font-size:12px; color:#64748b; margin-top:4px;">Tool: ${item.tool_required || 'None required'}</div>
                </div>
            `).join('');

            issues.forEach(item => {
                const card = document.getElementById(`issue-card-${item.id}`);
                if (card) {
                    card.onclick = () => {
                        // Pass the full facility object directly
                        window.navigateTo('facilityIssues', facility);
                    };
                }
            });
        } else {
            listDiv.innerHTML = '<div style="text-align:center; color:#94a3b8; font-style:italic;">No pending active issues found.</div>';
        }
    };

    document.getElementById('addNewProjectBtn').onclick = () => {
        window.navigateTo('facilityIssues', facility);
    };

    document.getElementById('backToHub2').onclick = () => {
        window.navigateTo('facilityControls', facility);
    };

    await loadPendingItems();
}
