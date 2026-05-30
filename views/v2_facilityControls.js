/* =================================================
FILE: views/v2_facilityControls.js
UPDATED: 2026-05-29 07:45:00 AM

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

export async function renderFacilityControls(data) {
    const app = document.getElementById('app');
    if (!app) return;

    // Unpack unified payload container or fallback safely
    const facility = data?.facility ? data.facility : data;

    window.navigateTo = window.navigateTo || function(view, data) {
        console.log('Navigate to (fallback):', view, data);
    };

    app.innerHTML = `
        <div style="padding: 20px; font-family: Arial; background:#f3f4f6; min-height:100vh; text-align:center;">
            <div style="margin-bottom:14px;">
                <h1 style="color:#00264d; font-size:22px; margin:0 0 12px 0; line-height:1.1; text-align:center; text-transform:uppercase;">
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
                
                <!-- STANDARD/INDIVIDUAL CONCERNS WORK STREAM -->
                <button id="toIndividualIssues" style="padding:20px; background:#28a745; color:white; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    👤 INDIVIDUAL CONCERNS
                    <span id="issuesBadge" style="background:red; color:white; font-size:12px; padding:2px 6px; border-radius:8px; margin-left:6px; display:none;"></span>
                </button>

                <button id="toContacts" style="padding:20px; background:#f5c400; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    MANAGE CONTACTS
                </button>

                <!-- PROPRIETARY MANAGER PROJECT WORK STREAM -->
                <button id="toProjects" style="padding:20px; background:#00264d; color:white; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    🏗️ PENDING PROJECTS
                    <span id="projectBadge" style="background:red; color:white; font-size:12px; padding:2px 6px; border-radius:8px; margin-left:6px; display:none;"></span>
                </button>

                <button id="toGallery" style="padding:20px; background:#10b981; color:white; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    IMAGE GALLERY
                </button>

                <button id="backDash" style="padding:12px; background:#6b7280; color:white; border:none; border-radius:8px; cursor:pointer; margin-top:10px;">
                    BACK TO DASHBOARD
                </button>
            </div>
            
            <div style="margin-top:50px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v2_facilityControls.js | Updated: 2026-05-29 07:45:00 AM
            </div>
        </div>
    `;

    async function loadBadges() {
        if (!facility?.id) return;

        // Fetch count for Standard Individual Concerns
        const { data: standardIssues, error: issuesErr } = await supabase
            .from('facility_issues')
            .select('id')
            .eq('open_issue', true)
            .eq('facility_id', facility.id);

        // Fetch count for Project Tasks
        const { data: projectIssues, error: projectsErr } = await supabase
            .from('facility_projects')
            .select('*')
            .eq('facility_id', facility.id)
            .eq('active_status', true);

        if (issuesErr) console.error("Error fetching standard issues badge:", issuesErr);
        if (projectsErr) console.error("Error fetching project badge:", projectsErr);

        const issuesBadge = document.getElementById('issuesBadge');
        const projectBadge = document.getElementById('projectBadge');
        
        if (issuesBadge && standardIssues) {
            issuesBadge.style.display = standardIssues.length > 0 ? 'inline-block' : 'none';
            issuesBadge.textContent = standardIssues.length;
        }

        if (projectBadge && projectIssues) {
            projectBadge.style.display = projectIssues.length > 0 ? 'inline-block' : 'none';
            projectBadge.textContent = projectIssues.length;
        }
    }

    await loadBadges();

    let controlsChannel = null;
    if (facility?.id) {
        const channelName = `facility_controls_realtime_${facility.id}`;
        supabase.removeChannel(supabase.channel(channelName));

        controlsChannel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'facility_issues', 
                    filter: `facility_id=eq.${facility.id}` 
                },
                () => loadBadges()
            )
            .subscribe();
    }

    const navigateWithCleanup = (target) => {
        if (controlsChannel) supabase.removeChannel(controlsChannel);
        window.navigateTo(target, { facility });
    };

    document.getElementById('toIndividualIssues').onclick = () => navigateWithCleanup('facilityIssues');
    document.getElementById('toContacts').onclick = () => navigateWithCleanup('facilityContacts');
    document.getElementById('toProjects').onclick = () => navigateWithCleanup('pendingProjects');
    document.getElementById('toGallery').onclick = () => navigateWithCleanup('facilityImages');
    document.getElementById('backDash').onclick = () => navigateWithCleanup('dashboard');
}
