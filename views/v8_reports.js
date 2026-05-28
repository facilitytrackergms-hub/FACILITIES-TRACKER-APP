/* =================================================
FILE: views/v8_reports.js
UPDATED: 2026-05-29 03:20:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep the header at the top of current files and new files.
================================================= */

import { supabase } from '../js/supabaseClient.js';

export async function renderReports(facility) {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; background:#f3f4f6; min-height:100vh; text-align:center;">
            <h1 style="color:#00264d; font-size:22px;">Facility Report</h1>
            <p style="color:#4b5563; margin-bottom:25px;">Facility: <strong>${facility.Name}</strong></p>

            <div style="display:flex; flex-direction:column; gap:12px; max-width:700px; margin:0 auto;">
                <button id="backBtn" style="padding:12px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer; margin-bottom:20px;">BACK TO DASHBOARD</button>
                <div id="reportContent" style="background:white; padding:15px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.08); text-align:left;">
                    <div style="text-align:center; color:#94a3b8; font-style:italic;">Loading report...</div>
                </div>
            </div>

            <div style="margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v8_reports.js | Updated: 2026-05-29 03:20:00 AM
            </div>
        </div>
    `;

    const reportContent = document.getElementById('reportContent');

    document.getElementById('backBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('dashboard');
    };

    // Fetch projects and issues for this facility
    const { data: projects } = await supabase
        .from('FACILITY_PROJECTS')
        .select('*')
        .eq('facility_id', facility.id);

    if (!projects || projects.length === 0) {
        reportContent.innerHTML = '<div style="text-align:center; color:#94a3b8; font-style:italic;">No projects found for this facility.</div>';
        return;
    }

    let html = '';
    for (const project of projects) {
        html += `<h3 style="color:#00264d; margin-top:20px;">Project: ${project.project_name}</h3>`;
        
        const { data: issues } = await supabase
            .from('FACILITY_PROJECT_ISSUES')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: true });

        if (!issues || issues.length === 0) {
            html += '<p style="color:#64748b; font-style:italic;">No issues reported.</p>';
            continue;
        }

        html += '<ul style="padding-left:20px;">';
        for (const issue of issues) {
            html += `<li><strong>${issue.description}</strong> (Initiated by: ${issue.initiated_by || 'N/A'}) - Status: ${issue.open_issue ? 'Open' : 'Closed'}</li>`;

            const { data: followups } = await supabase
                .from('ISSUE_FOLLOWUPS')
                .select('*')
                .eq('issue_id', issue.id)
                .order('timestamp', { ascending: true });

            if (followups && followups.length > 0) {
                html += '<ul style="padding-left:15px;">';
                for (const f of followups) {
                    html += `<li>${f.action_type || 'Action'} by ${f.action_by || 'N/A'} on ${new Date(f.timestamp).toLocaleDateString()}: ${f.description}</li>`;
                }
                html += '</ul>';
            }

            // Optional: Include images for the issue
            const { data: images } = await supabase
                .from('FACILITY_PROJECT_ISSUE_IMAGES')
                .select('*')
                .eq('issue_id', issue.id);

            if (images && images.length > 0) {
                html += '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:5px;">';
                for (const img of images) {
                    html += `<img src="${img.image_url}" style="width:80px; height:60px; object-fit:cover; border-radius:6px;">`;
                }
                html += '</div>';
            }
        }
        html += '</ul>';
    }

    reportContent.innerHTML = html;
}
