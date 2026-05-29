/* =================================================
FILE: views/v8_reports.js
UPDATED: 2026-05-28 10:45:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep the header at the top of current files and new files.

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

export async function renderReports(data) {
    const app = document.getElementById('app');
    if (!app) return;

    // Unpack unified payload container or fallback safely
    const facility = data?.facility ? data.facility : data;

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; background:#f3f4f6; min-height:100vh; text-align:center;">
            <h1 style="color:#00264d; font-size:22px;">Facility Report</h1>
            <p style="color:#4b5563; margin-bottom:25px;">Facility: <strong>${facility?.Name || ''}</strong></p>

            <div style="display:flex; flex-direction:column; gap:12px; max-width:700px; margin:0 auto;">
                <button id="backBtn" style="padding:12px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer; margin-bottom:20px;">BACK TO DASHBOARD</button>
                <div id="reportContent" style="background:white; padding:15px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05); text-align:left;">
                    <div style="text-align:center; color:#94a3b8; font-style:italic;">Compiling summary data...</div>
                </div>
            </div>

            <div style="margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v8_reports.js | Updated: 2026-05-28 10:45:00 PM
            </div>
        </div>
    `;

    document.getElementById('backBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('dashboard');
    };

    const generateReportHTML = async () => {
        const contentDiv = document.getElementById('reportContent');
        if (!facility?.id) {
            contentDiv.innerHTML = '<p style="color:red; text-align:center;">Missing facility reference.</p>';
            return;
        }

        const { data: issues, error } = await supabase
            .from('FACILITY_PROJECT_ISSUES')
            .select('*')
            .eq('project_id', facility.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            contentDiv.innerHTML = '<p style="color:red; text-align:center;">Error assembling tracking report.</p>';
            return;
        }

        if (!issues || issues.length === 0) {
            contentDiv.innerHTML = '<p style="color:#64748b; text-align:center; font-style:italic;">No logged issues found for this facility.</p>';
            return;
        }

        let html = '<h3 style="color:#00264d; margin-top:0;">Active & Historic Tracker Overview</h3>';
        html += '<ul style="padding-left:20px; line-height:1.6; color:#333;">';

        for (const issue of issues) {
            html += `<li style="margin-bottom:20px;"><strong>${issue.description}</strong> (Initiated by: ${issue.initiated_by || 'N/A'}) - Status: <span style="color:${issue.open_issue ? '#dc2625' : '#28a745'}; font-weight:bold;">${issue.open_issue ? 'Open' : 'Closed'}</span>`;

            const { data: followups } = await supabase
                .from('ISSUE_FOLLOWUPS')
                .select('*')
                .eq('issue_id', issue.id)
                .order('timestamp', { ascending: true });

            if (followups && followups.length > 0) {
                html += '<ul style="padding-left:15px; margin-top:5px; color:#4b5563; font-size:13px; list-style-type:circle;">';
                for (const f of followups) {
                    html += `<li><strong>${f.action_type || 'Action'}</strong> by ${f.action_by || 'N/A'} on ${new Date(f.timestamp).toLocaleDateString()}: ${f.description}</li>`;
                }
                html += '</ul>';
            }

            const { data: images } = await supabase
                .from('FACILITY_PROJECT_ISSUE_IMAGES')
                .select('*')
                .eq('issue_id', issue.id);

            if (images && images.length > 0) {
                html += '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; padding-left:15px;">';
                for (const img of images) {
                    html += `<img src="${img.image_url}" style="width:80px; height:60px; object-fit:cover; border-radius:6px; border:1px solid #e5e7eb;">`;
                }
                html += '</div>';
            }
            html += '</li>';
        }

        html += '</ul>';
        contentDiv.innerHTML = html;
    };

    await generateReportHTML();
}
