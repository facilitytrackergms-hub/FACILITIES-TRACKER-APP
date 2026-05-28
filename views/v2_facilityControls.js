/* =================================================
FILE: views/v2_facilityControls.js
UPDATED: 2026-05-29 05:10:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';

export async function renderFacilityControls(facility) {
    const app = document.getElementById('app');
    if (!app) return;

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

            <div style="margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v2_facilityControls.js | Updated: 2026-05-29 05:10:00 AM
            </div>
        </div>
    `;

    async function loadHeaderImage() {
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

        if (data && data[0]?.image_url) {
            headerImageBox.innerHTML = `<img src="${data[0].image_url}" style="width:100%; height:100%; object-fit:cover;">`;
        }
    }

    await loadHeaderImage();

    async function loadBadges() {
        const { data: contacts } = await supabase.from('CONTACTS').select('id').eq('facility_id', facility.id);
        const { data: openIssues } = await supabase.from('FACILITY_PROJECT_ISSUES').select('id, contact_id').eq('open_issue', true).eq('project_id', facility.id);

        const contactBadge = document.getElementById('contactBadge');
        const projectBadge = document.getElementById('projectBadge');

        const openContacts = new Set(openIssues.map(i => i.contact_id));
        if (openContacts.size > 0) {
            contactBadge.style.display = 'inline-block';
            contactBadge.textContent = openContacts.size;
        } else {
            contactBadge.style.display = 'none';
        }

        if (openIssues.length > 0) {
            projectBadge.style.display = 'inline-block';
            projectBadge.textContent = openIssues.length;
        } else {
            projectBadge.style.display = 'none';
        }
    }

    await loadBadges();

    document.getElementById('toContacts').onclick = async () => {
        const { data: contacts } = await supabase.from('CONTACTS').select('*').eq('facility_id', facility.id);
        const { data: openIssues } = await supabase.from('FACILITY_PROJECT_ISSUES').select('id, contact_id').eq('open_issue', true).eq('project_id', facility.id);
        window.navigateTo('facilityContacts', { facility, contacts, openIssues });
    };

    document.getElementById('toProjects').onclick = async () => {
        const { data: projects } = await supabase.from('FACILITY_PROJECTS').select('*').eq('facility_id', facility.id);
        window.navigateTo('pendingProjects', { facility, projects });
    };

    document.getElementById('toGallery').onclick = () => window.navigateTo('facilityImages', facility);
    document.getElementById('backDash').onclick = () => window.navigateTo('dashboard', facility);

    const contactSearch = document.getElementById('contactSearch');
    const contactFilter = document.getElementById('contactIssueFilter');

    contactSearch.oninput = loadBadges;
    contactFilter.onchange = loadBadges;
}
/* Add this at the end of v2_facilityControls.js after loadBadges() */

supabase
  .from(`FACILITY_PROJECT_ISSUES:project_id=eq.${facility.id}`)
  .on('INSERT', payload => loadBadges())
  .on('UPDATE', payload => loadBadges())
  .subscribe();
