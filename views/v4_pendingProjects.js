/* =================================================
FILE: views/v4_pendingProjects.js
UPDATED: 2026-05-28 08:30:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';

export async function renderPendingProjects(facility, contact = null) {
    const app = document.getElementById('app');
    
    // Safety check fallback to avoid app crashes if data missing
    const facilityName = facility?.Name || 'Unknown Facility';
    const facilityId = facility?.id || null;

    app.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; font-family: Arial; background: #f3f4f6; min-height: 100vh;">
            <h1 style="color: #00264d; margin-bottom: 10px;">PENDING PROJECTS</h1>
            <p style="color: #64748b; margin-bottom: 30px;">
                Facility: <strong>${facilityName}</strong>
                ${contact?.name ? ` | Contact: <strong>${contact.name}</strong>` : ''}
            </p>

            <div style="display: flex; flex-direction: column; gap: 15px; max-width: 400px; margin: 0 auto;">
                <button id="addNewProjectBtn" style="padding: 20px; background: #28a745; color: white; font-weight: bold; border: none; border-radius: 12px; cursor: pointer; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    ADD NEW ISSUE
                </button>
                
                <div id="pendingProjectsList" style="margin-top: 20px; display: flex; flex-direction: column; gap: 12px; text-align: left;">
                    <div style="text-align: center; color: #94a3b8; font-style: italic;">Loading active items...</div>
                </div>
                
                <button id="backToHub2" style="padding: 15px; background: #00264d; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; margin-top: 20px;">BACK TO CONTROLS</button>
            </div>
            
            <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                File: v4_pendingProjects.js | Updated: 2026-05-28 08:30:00 PM
            </div>
        </div>
    `;

    // Fetch and show actual active open items matching this facility
    const loadPendingItems = async () => {
        const listDiv = document.getElementById('pendingProjectsList');
        if (!facilityId) {
            listDiv.innerHTML = '<div style="text-align:center; color:#94a3b8;">Missing facility reference.</div>';
            return;
        }

        const { data, error } = await supabase
            .from('FACILITY_PROJECT_ISSUES')
            .select('*')
            .eq('project_id', facilityId)
            .eq('open_issue', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            listDiv.innerHTML = '<div style="text-align:center; color:#dc3545;">Error loading tracking data.</div>';
            return;
        }

        if (data && data.length > 0) {
            listDiv.innerHTML = data.map(item => `
                <div style="background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #dc3545; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" 
                     onclick="window.navigateTo('facilityIssues', { facility: ${JSON.stringify(facility).replace(/"/g, '&quot;')}, contact: ${contact ? JSON.stringify(contact).replace(/"/g, '&quot;') : 'null'} })">
                    <div style="display: flex; justify-content: space-between;">
                        <strong style="color: #00264d;">${item.description}</strong>
                        <span style="font-size: 10px; color: #94a3b8;">${new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Tool: ${item.tool_required || 'None required'}</div>
                </div>
            `).join('');
        } else {
            listDiv.innerHTML = '<div style="text-align: center; color: #94a3b8; font-style: italic;">No pending active issues found.</div>';
        }
    };

    // Navigation bindings adhering to single-argument router object contract
    document.getElementById('addNewProjectBtn').onclick = () => {
        if (window.navigateTo) {
            window.navigateTo('facilityIssues', { facility, contact });
        }
    };

    document.getElementById('backToHub2').onclick = () => {
        if (window.navigateTo) {
            window.navigateTo('facilityControls', facility);
        }
    };

    // Run item load query
    loadPendingItems();
}
