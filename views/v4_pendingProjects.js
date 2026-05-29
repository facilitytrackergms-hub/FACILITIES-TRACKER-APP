/* =================================================
FILE: views/v4_FacilityControls.js
PURPOSE: Provide Split Navigation Panel for Standard Issues vs Project Tracker
UPDATED: 2026-05-29 06:58:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';

export async function renderFacilityControls(facility) {
    if (!facility || !facility.id) {
        console.error("Facility object is missing or invalid");
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; background:#f3f4f6; min-height:100vh; text-align:center;">
            <h1 style="color:#00264d; font-size:24px; text-transform:uppercase; margin-bottom:5px;">${facility.Name}</h1>
            <p style="color:#6b7280; margin-bottom:30px;">${facility.Address || 'No Address Provided'}</p>

            <div style="display:flex; flex-direction:column; gap:20px; max-width:450px; margin:0 auto; text-align:left;">
                
                <div style="background:white; padding:20px; border-radius:12px; box-shadow:0 2px 5px rgba(0,0,0,0.05); border-left:6px solid #28a745;">
                    <h3 style="margin-top:0; color:#00264d; display:flex; justify-content:between; align-items:center;">
                        🛠️ STANDARD ISSUES
                    </h3>
                    <p style="font-size:13px; color:#6b7280; margin-bottom:15px;">Daily maintenance problems reported by on-site contacts and employees.</p>
                    <div style="display:flex; gap:10px;">
                        <button id="viewStandardIssuesBtn" style="flex:1; padding:12px; background:#28a745; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">MANAGE ISSUES</button>
                        <button id="viewContactsBtn" style="padding:12px; background:#eee; color:#00264d; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">👤 CONTACTS</button>
                    </div>
                </div>

                <div style="background:white; padding:20px; border-radius:12px; box-shadow:0 2px 5px rgba(0,0,0,0.05); border-left:6px solid #00264d;">
                    <h3 style="margin-top:0; color:#00264d;">
                        🏗️ PROJECT MANAGEMENT
                    </h3>
                    <p style="font-size:13px; color:#6b7280; margin-bottom:15px;">High-level ongoing renovations, capital projects, and outgoing updates managed by you.</p>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <button id="viewProjectsBtn" style="width:100%; padding:12px; background:#00264d; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">TRACK ACTIVE PROJECTS</button>
                        <button id="addNewProjectBtn" style="width:100%; padding:12px; background:#f5c400; color:#00264d; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">+ ADD NEW PROJECT</button>
                    </div>
                </div>

                <button id="backToDashboard" style="padding:14px; background:#6b7280; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:10px; text-align:center;">BACK TO MAIN DASHBOARD</button>
            </div>

            <div id="quickProjectModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:2000; justify-content:center; align-items:center; padding:20px;">
                <div style="background:white; padding:25px; border-radius:12px; width:100%; max-width:420px; text-align:left; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                    <h3 style="margin-top:0; color:#00264d; border-bottom:2px solid #f5c400; padding-bottom:10px;">Create Active Project</h3>
                    
                    <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">PROJECT NAME</label>
                    <input type="text" id="quickProjectTitle" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px;" placeholder="e.g., Roof Renovation, Paving">
                    
                    <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">BUDGET / ALLOCATION</label>
                    <input type="text" id="quickProjectBudget" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px;" placeholder="e.g., $15,000">

                    <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">NOTES & SCOPE</label>
                    <textarea id="quickProjectNotes" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px; min-height:80px;" placeholder="Scope guidelines..."></textarea>
                    
                    <div style="display:flex; gap:10px; margin-top:25px;">
                        <button id="quickProjectSaveBtn" style="flex:1; padding:13px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">CREATE PROJECT</button>
                        <button id="quickProjectCloseBtn" style="flex:1; padding:13px; background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer;">CANCEL</button>
                    </div>
                </div>
            </div>

            <div style="margin-top:50px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v4_FacilityControls.js | Updated: 2026-05-29 06:58:00 AM
            </div>
        </div>
    `;

    // Standard Issue Routing Tracks
    document.getElementById('viewStandardIssuesBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('facilityIssues', { facility });
    };

    document.getElementById('viewContactsBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('facilityContacts', { facility });
    };

    // Project View Routing Tracks
    document.getElementById('viewProjectsBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('pendingProjects', { facility });
    };

    // Quick Add Project Actions Context Configuration
    document.getElementById('addNewProjectBtn').onclick = () => {
        document.getElementById('quickProjectTitle').value = '';
        document.getElementById('quickProjectBudget').value = '';
        document.getElementById('quickProjectNotes').value = '';
        document.getElementById('quickProjectModal').style.display = 'flex';
    };

    document.getElementById('quickProjectSaveBtn').onclick = async () => {
        const titleVal = document.getElementById('quickProjectTitle').value.trim();
        if (!titleVal) {
            alert("Please supply a project scope title descriptor.");
            return;
        }

        const payload = {
            project_title: titleVal,
            budget: document.getElementById('quickProjectBudget').value.trim(),
            notes: document.getElementById('quickProjectNotes').value.trim(),
            facility_id: facility.id,
            active_status: true,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('FACILITY_PROJECTS').insert([payload]);
        if (error) {
            console.error(error);
            alert("Could not append project details to data core.");
        } else {
            document.getElementById('quickProjectModal').style.display = 'none';
            if (window.navigateTo) window.navigateTo('pendingProjects', { facility });
        }
    };

    document.getElementById('quickProjectCloseBtn').onclick = () => {
        document.getElementById('quickProjectModal').style.display = 'none';
    };

    document.getElementById('backToDashboard').onclick = () => {
        if (window.navigateTo) window.navigateTo('facilitiesDashboard');
    };
}
