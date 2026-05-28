/* =================================================
FILE: views/v2_facilityControls.js
UPDATED: 2026-05-29 07:15:00 AM

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

GITHUB PUSH RULE:
1. Never do full-file replacement when pushing directly to GitHub unless the file is small and the change is simple.
2. Fetch the current file from GitHub first.
3. Make the smallest possible code change.
4. Push only the targeted section that needs the update.
5. If the request is large, split it into small commits.
6. If a full-file replacement is needed, create/download the full file for manual upload instead of pushing the whole file through the GitHub tool.
7. Never touch unrelated files or unrelated sections.
8. Always confirm whether the push succeeded or failed.
9. If GitHub blocks the write action, explain clearly that nothing was pushed.
================================================= */
import { supabase } from '../js/supabaseClient.js';

export async function renderFacilityControls(facility) {
    const app = document.getElementById('app');
    if (!app) return;

    // Ensure window.navigateTo exists as a fallback
    window.navigateTo = window.navigateTo || function(view, facility) {
        console.log('Navigate to (fallback):', view, facility);
        alert(`Navigate to: ${view}`);
    };

    app.innerHTML = `
        <div style="padding: 20px; font-family: Arial; background:#f3f4f6; min-height:100vh; text-align:center;">
            <div style="margin-bottom:14px;">
                <h1 style="color:#111827; font-size:22px; margin:0 0 12px 0; line-height:1.1; text-align:center;">
                    ${facility?.Name || 'FACILITY'} CONTROLS
                </h1>

                <div id="facility-header-image" style="width:160px; height:110px; border-radius:14px; overflow:hidden; background:white; border:2px solid #e5e7eb; display:flex; align-items:center; justify-content:center; margin:0 auto;">
                    <span style="font-size:10px; color:#94a3b8;">IMAGE</span>
                </div>

                <input type="text" id="contactSearch" placeholder="Search contacts..." style="width:90%; margin-top:10px; padding:8px; border-radius:5px;">
                <select id="contactIssueFilter" style="width:90%; margin:10px auto; padding:8px; border-radius:5px;">
                    <option value="all">All Contacts</option>
                    <option value="withOpen">With Open Issues</option>
                    <option value="noOpen">No Open Issues</option>
                </select>
            </div>

            <div style="width:100%; max-width:320px; height:5px; background:#000; margin:0 auto 25px auto; border-radius:2px;"></div>

            <div style="display:flex; flex-direction:column; gap:15px; max-width:320px; margin:0 auto;">
                <button id="toContacts" style="padding:20px; background:#f5c400; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    CONTACTS
                    <span id="contactBadge" style="background:red; color:white; font-size:12px; padding:2px 6px; border-radius:8px; margin-left:6px; display:none;"></span>
                </button>

                <button id="toProjects" style="padding:20px; background:#00264d; color:white; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    PENDING PROJECTS
                    <span id="projectBadge" style="background:red; color:white; font-size:12px; padding:2px 6px; border-radius:8px; margin-left:6px; display:none;"></span>
                </button>

                <button id="toGallery" style="padding:20px; background:#10b981; color:white; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    IMAGE GALLERY
                </button>

                <button id="backDash" style="padding:12px; background:#6b7280; color:white; border:none; border-radius:8px; cursor:pointer; margin-top:10px;">
                    BACK TO DASHBOARD
                </button>
            </div>
        </div>
    `;

    async function loadBadges() {
        const { data: openIssues } = await supabase
            .from('FACILITY_PROJECT_ISSUES')
            .select('id, contact_id')
            .eq('open_issue', true)
            .eq('project_id', facility.id);

        const contactBadge = document.getElementById('contactBadge');
        const projectBadge = document.getElementById('projectBadge');

        const openContacts = new Set(openIssues.map(i => i.contact_id));
        contactBadge.style.display = openContacts.size > 0 ? 'inline-block' : 'none';
        contactBadge.textContent = openContacts.size;

        projectBadge.style.display = openIssues.length > 0 ? 'inline-block' : 'none';
        projectBadge.textContent = openIssues.length;
    }

    await loadBadges();

    // --- Supabase v2 real-time subscription ---
    const controlsChannel = supabase
      .channel(`public:facility_project_issues`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'FACILITY_PROJECT_ISSUES', filter: `project_id=eq.${facility.id}` },
        (payload) => {
          console.log('Realtime update:', payload);
          loadBadges();
        }
      )
      .subscribe();

    document.getElementById('toContacts').onclick = () => window.navigateTo('facilityContacts', facility);
    document.getElementById('toProjects').onclick = () => window.navigateTo('pendingProjects', facility);
    document.getElementById('toGallery').onclick = () => window.navigateTo('facilityImages', facility);
    document.getElementById('backDash').onclick = () => window.navigateTo('dashboard', facility);
}
