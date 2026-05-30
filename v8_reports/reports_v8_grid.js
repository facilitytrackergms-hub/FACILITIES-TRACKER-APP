/* =================================================
FILE: reports_v8_grid.js
PURPOSE: Render Facility Report Summary UI
UPDATED: 2026-05-29 10:15:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
================================================= */
import { fetchReportIssues, fetchFollowupsForIssue, fetchImagesForIssue } from './reports_v8_data.js';

export async function renderReports(data) {
    const app = document.getElementById('app');
    if (!app) return;

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
                File: reports_v8_grid.js | Updated: 2026-05-29 10:15:00 PM
            </div>
        </div>
    `;

    document.getElementById('backBtn').onclick = () => {
        if (window.navigateTo) window.navigateTo('facility_dashboard');
    };

    const generateReportHTML = async () => {
        const contentDiv = document.getElementById('reportContent');
        if (!facility?.id) {
            contentDiv.innerHTML = '<p style="color:red; text-align:center;">Missing facility reference.</p>';
            return;
        }

        const { data: issues, error } = await fetchReportIssues(facility.id);

        if (error) {
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

            const { data: followups } = await fetchFollowupsForIssue(issue.id);
            if (followups && followups.length > 0) {
                html += '<ul style="padding-left:15px; margin-top:5px; color:#4b5563; font-size:13px; list-style-type:circle;">';
                for (const f of followups) {
                    html += `<li><strong>${f.action_type || 'Action'}</strong> by ${f.action_by || 'N/A'} on ${new Date(f.timestamp).toLocaleDateString()}: ${f.description}</li>`;
                }
                html += '</ul>';
            }

            const { data: images } = await fetchImagesForIssue(issue.id);
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
