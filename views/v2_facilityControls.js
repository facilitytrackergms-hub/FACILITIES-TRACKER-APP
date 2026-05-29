/* =================================================
FILE: views/v2_facilityControls.js
UPDATED: 2026-05-29 08:15:00 PM
================================================= */
import { supabase } from '../js/supabaseClient.js';

export async function renderFacilityControls(facility) {
    const app = document.getElementById('app');
    if (!app) return;

    if (!facility || !facility.id) {
        console.error("Invalid facility passed to renderFacilityControls:", facility);
        return;
    }

    window.navigateTo = window.navigateTo || function(view, data) {
        console.log('Navigate to (fallback):', view, data);
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

                <button id="toIssues" style="padding:20px; background:#dc2626; color:white; font-weight:bold; border:none; border-radius:12px; cursor:pointer; font-size:16px;">
                    ISSUES
                </button>

                <button id="backDash" style="padding:12px; background:#6b7280; color:white; border:none; border-radius:8px; cursor:pointer; margin-top:10px;">
                    BACK TO DASHBOARD
                </button>
            </div>
        </div>
    `;

    async function loadBadges() {
        if (!facility?.id) return;

        const { data: openIssues, error } = await supabase
            .from('FACILITY_PROJECT_ISSUES')
            .select('id, contact_id')
            .eq('open_issue', true)
            .eq('project_id', facility.id);

        if (error) {
            console.error("Error fetching badges:", error);
            return;
        }

        const contactBadge = document.getElementById('contactBadge');
        const projectBadge = document.getElementById('projectBadge');
        if (!contactBadge || !projectBadge) return;

        const safeIssues = openIssues || [];
        const openContacts = new Set(safeIssues.map(i => i.contact_id).filter(id => id));
        
        contactBadge.style.display = openContacts.size > 0 ? 'inline-block' : 'none';
        contactBadge.textContent = openContacts.size;

        projectBadge.style.display = safeIssues.length > 0 ? 'inline-block' : 'none';
        projectBadge.textContent = safeIssues.length;
    }

    await loadBadges();

    let controlsChannel = null;
    if (facility?.id) {
        const channelName = `facility_controls_${facility.id}`;
        supabase.removeChannel(supabase.channel(channelName));

        controlsChannel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'FACILITY_PROJECT_ISSUES', 
                    filter: `project_id=eq.${facility.id}` 
                },
                () => loadBadges()
            )
            .subscribe();
    }

    const navigateWithCleanup = (target) => {
        if (controlsChannel) supabase.removeChannel(controlsChannel);
        // Always pass the full facility object
        window.navigateTo(target, facility);
    };

    document.getElementById('toContacts').onclick = () => navigateWithCleanup('facilityContacts');
    document.getElementById('toProjects').onclick = () => navigateWithCleanup('pendingProjects');
    document.getElementById('toGallery').onclick = () => navigateWithCleanup('facilityImages');
    document.getElementById('toIssues').onclick = () => navigateWithCleanup('facilityIssues');
    document.getElementById('backDash').onclick = () => navigateWithCleanup('dashboard');
}

// --- VER TAG ---
console.log("Updated: 2026-05-29 08:15 PM • v2_facilityControls.js");
