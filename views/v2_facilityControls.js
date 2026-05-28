/* =================================================
FILE: views/v2_facilityControls.js
UPDATED: 2026-05-28 11:45:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.

STRICT FILE RULES:
1. Always output the full, complete file content.
2. NEVER ask the user to "find and replace" or manually edit code.
3. Do NOT change code, logic, or styling unless explicitly requested.
4. Keep the file exactly as it is, only applying the requested updates.
5. WE CANNOT CREATE EMPTY FILES. Validation is required.
6. Always update the visible version tag for every touched view/file, including V2. If any code update affects the app, update the visible bottom version label with the current date, time, and exact file name.
================================================= */

import { supabase } from '../js/supabaseClient.js';

export async function renderFacilityControls(facility) {
    const app = document.getElementById('app');
    if (!app) return;

    // Render the main facility controls UI
    app.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial; background: #f3f4f6; min-height: 100vh;">
            <div style="margin-bottom:14px;">
                <h1 style="color:#111827; font-size:22px; margin:0 0 12px 0; line-height:1.1; text-align:center;">
                    ${facility?.Name || 'FACILITY'} CONTROLS
                </h1>

                <div id="facility-header-image" style="width:160px; height:110px; border-radius:14px; overflow:hidden; background:white; border:2px solid #e5e7eb; display:flex; align-items:center; justify-content:center; margin:0 auto;">
                    <span style="font-size:10px; color:#94a3b8;">IMAGE</span>
                </div>
            </div>

            <div style="width:100%; max-width:320px; height:5px; background:#000; margin:0 auto 25px auto; border-radius:2px;"></div>

            <div style="display:flex; flex-direction:column; gap:15px; max-width:320px; margin:0 auto;">
                <button id="toContacts" style="padding:20px; background:#f5c400; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    CONTACTS
                </button>

                <button id="toProjects" style="padding:20px; background:#00264d; color:white; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    PENDING PROJECTS
                </button>

                <button id="toGallery" style="padding:20px; background:#10b981; color:white; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    IMAGE GALLERY
                </button>

                <button id="backDash" style="padding:12px; background:#6b7280; color:white; border:none; border-radius:8px; cursor:pointer; margin-top:10px;">
                    BACK TO DASHBOARD
                </button>
            </div>

            <div style="margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v2_facilityControls.js | Updated: 2026-05-28 11:45:00 PM
            </div>
        </div>
    `;

    // Load facility header image
    async function loadFacilityHeaderImage() {
        const headerImageBox = document.getElementById('facility-header-image');
        if (!headerImageBox || !facility?.id) return;

        const { data, error } = await supabase
            .from('FACILITY_IMAGES')
            .select('image_url')
            .eq('facility_id', facility.id)
            .eq('related_type', 'facility')
            .eq('related_id', facility.id)
            .order('created_at', { ascending: true })
            .limit(1);

        if (error) {
            console.error('Load facility header image error:', error);
            return;
        }

        if (data && data[0] && data[0].image_url) {
            headerImageBox.innerHTML = `<img src="${data[0].image_url}" style="width:100%; height:100%; object-fit:cover; display:block;">`;
        }
    }

    await loadFacilityHeaderImage();

    // Button navigation
    document.getElementById('toContacts').onclick = async () => {
        if (window.navigateTo) {
            // Optionally fetch number of open issues per contact for alert
            const { data: contacts } = await supabase
                .from('CONTACTS')
                .select('*')
                .eq('facility_id', facility.id);
            
            const { data: openIssues } = await supabase
                .from('FACILITY_PROJECT_ISSUES')
                .select('id, contact_id, open_issue')
                .eq('open_issue', true)
                .eq('project_id', facility.id);

            // You could pass openIssues counts for UI badges if needed
            window.navigateTo('facilityContacts', { facility, contacts, openIssues });
        }
    };

    document.getElementById('toProjects').onclick = async () => {
        if (window.navigateTo) {
            // Optionally fetch project info
            const { data: projects } = await supabase
                .from('FACILITY_PROJECTS')
                .select('*')
                .eq('facility_id', facility.id);
            
            window.navigateTo('pendingProjects', { facility, projects });
        }
    };

    document.getElementById('toGallery').onclick = () => {
        if (window.navigateTo) {
            window.navigateTo('facilityImages', facility);
        }
    };

    document.getElementById('backDash').onclick = () => {
        if (window.navigateTo) {
            window.navigateTo('dashboard');
        }
    };
}
