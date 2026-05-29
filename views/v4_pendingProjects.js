/* =================================================
FILE: views/v4_pendingProjects.js
PURPOSE: Track Active Capital Projects with Independent Data Creation Contexts
UPDATED: 2026-05-29 07:22:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';

export async function renderPendingProjects(data) {
    const facility = data?.facility ? data.facility : data;

    if (!facility || !facility.id) {
        console.error("Facility context missing inside project viewer grid.");
        return;
    }

    const app = document.getElementById('app');

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; background:#f3f4f6; min-height:100vh; text-align:center;">
            <h1 style="color:#00264d; font-size:22px; text-transform:uppercase; margin-bottom:5px;">Active Projects Tracker</h1>
            <p style="color:#4b5563; margin-bottom:25px;">Facility: ${facility.Name}</p>

            <div style="display:flex; flex-direction:column; gap:15px; max-width:400px; margin:0 auto;">
                <button id="projectTrackCreateBtn" style="padding:15px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">+ ADD NEW PROJECT</button>
                <button id="projectTrackBackBtn" style="padding:12px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer;">BACK TO CONTROLS</button>
                
                <div id="activeProjectsList" style="margin-top:20px; display:flex; flex-direction:column; gap:12px; text-align:left;">
                    <div style="text-align:center; color:#94a3b8; font-style:italic;">Loading active facility projects...</div>
                </div>
            </div>

            <div id="projectTrackFormModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:2000; justify-content:center; align-items:center; padding:20px;">
                <div style="background:white; padding:25px; border-radius:12px; width:100%; max-width:420px; text-align:left; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                    <h3 style="margin-top:0; color:#00264d; border-bottom:2px solid #f5c400; padding-bottom:10px;">Create Active Project</h3>
                    
                    <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">PROJECT NAME</label>
                    <input type="text" id="projectTrackTitleInput" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px;" placeholder="e.g., Roof Renovation, Paving">
                    
                    <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">BUDGET / ALLOCATION</label>
                    <input type="text" id="projectTrackBudgetInput" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px;" placeholder="e.g., $15,000">

                    <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:15px;">NOTES & SCOPE</label>
                    <textarea id="projectTrackNotesInput" style="width:100%; padding:11px; margin-top:5px; border:1px solid #ccc; border-radius:6px; min-height:80px;" placeholder="Scope guidelines..."></textarea>
                    
                    <div style="display:flex; gap:10px; margin-top:25px;">
                        <button id="projectTrackSaveBtn" style="flex:1; padding:13px; background:#28a745; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">CREATE PROJECT</button>
                        <button id="projectTrackCloseBtn" style="flex:1; padding:13px; background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer;">CANCEL</button>
                    </div>
                </div>
            </div>

            <div style="margin-top:50px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v4_pendingProjects.js | Updated: 2026-05-29 07:22:00 AM
            </div>
        </div>
    `;

    const loadFacilityProjects = async () => {
        let response = await supabase
            .from('FACILITY_PROJECTS')
            .select('*')
            .eq('facility_id', facility.id)
            .order('created_at', { ascending: false });

        if (response.error && response.error.code === '42703') {
            response = await supabase
                .from('FACILITY_PROJECTS')
                .select('*')
                .eq('facilityid', facility.id)
                .order('created_at', { ascending: false });
        }

        if (response.error) {
            console.error("Error loading facility projects:", response.error);
            document.getElementById('activeProjectsList').innerHTML = `<div style="text-align:center;color:#dc2626;font-weight:bold;">Schema sync lookup failed. Check table column definition capitalization.</div>`;
            return;
        }

        const dbData = response.data;
        const listContainer = document.getElementById('activeProjectsList');
        
        if (!dbData || !dbData.length) {
            listContainer.innerHTML = '<div style="text-align:center;color:#94a3b8;font-style:italic;">No pending active projects found.</div>';
            return;
        }

        listContainer.innerHTML = dbData.map(item => `
            <div style="background:white; padding:15px; border-radius:10px; border-left:5px solid #00264d; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <strong style="color:#00264d; font-size:16px; display:block; margin-bottom:4px;">${item.project_title || item.project_name || item.Title || 'Untitled Project'}</strong>
                ${item.budget ? `<span style="font-size:12px; background:#eff6ff; color:#1e40af; padding:2px 6px; border-radius:4px; font-weight:bold; display:inline-block; margin-bottom:8px;">Budget: ${item.budget}</span>` : ''}
                <p style="margin:0; font-size:13px; color:#4b5563; line-height:1.4;">${item.notes || 'No extra scope notes recorded.'}</p>
                <span style="font-size:10px; color:#94a3b8; display:block; margin-top:10px;">Created: ${new Date(item.created_at).toLocaleDateString()}</span>
            </div>
        `).join('');
    };

    document.getElementById('projectTrackCreateBtn').onclick = () => {
        document.getElementById('projectTrackTitleInput').value = '';
        document.getElementById('projectTrackBudgetInput').value = '';
        document.getElementById('projectTrackNotesInput').value = '';
        document.getElementById('projectTrackFormModal').style.display = 'flex';
    };

    document.getElementById('projectTrackSaveBtn').onclick = async () => {
        const titleVal = document.getElementById('projectTrackTitleInput').value.trim();
        if (!titleVal) {
            alert("Please supply a project scope title descriptor.");
            return;
        }

        const payload = {
            project_title: titleVal,
            project_name: titleVal,
            budget: document.getElementById('projectTrackBudgetInput').value.trim(),
            notes: document.getElementById('projectTrackNotesInput').value.trim(),
            facility_id: facility.id,
            facilityid: facility.id,
            active_status: true,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('FACILITY_PROJECTS').insert([payload]);
        if (error) {
            console.error(error);
            if (error.code === '23505') {
                alert("Database Constraint Error: This facility is restricted to a single project row in the database schema.");
            } else {
                alert(`Could not append project details: ${error.message}`);
            }
        } else {
            document.getElementById('projectTrackFormModal').style.display = 'none';
            await loadFacilityProjects();
        }
    };

    document.getElementById('projectTrackCloseBtn').onclick = () => {
        document.getElementById('projectTrackFormModal').style.display = 'none';
    };

    document.getElementById('projectTrackBackBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('facilityControls', facility);
    };

    await loadFacilityProjects();
}
