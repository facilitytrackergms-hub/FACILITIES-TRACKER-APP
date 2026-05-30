/* =================================================
FILE: js/main.js
PURPOSE: Router for View 1, 2, 3, 4, 5, 6, 7, and 8
UPDATED: 2026-05-30 09:10:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

window.navigateTo = async (view, context = null) => {
    const app = document.getElementById('app');
    if (!app) {
        console.error("Critical Error: Element with ID 'app' not found.");
        return;
    }
    
    app.innerHTML = '<div style="text-align:center; padding:50px; color:#64748b; font-family:Arial;">Loading...</div>';
    app.style.backgroundColor = ''; 

    console.log(`Navigating to: ${view}`, context);

    try {
        if (view === 'dashboard' || view === 'facility_dashboard') {
            const { renderFacilities } = await import('../views/v1_facilitiesDashboard.js');
            await renderFacilities();
        } 
        else if (view === 'facility_controls' || view === 'facilityControls') {
            // MATCHED TO SCREENSHOT: v2_facilityControls.js
            const { renderFacilityControls } = await import('../views/v2_facilityControls.js');
            await renderFacilityControls(context);
        } 
        else if (view === 'facility_contacts' || view === 'facilityContacts') {
            // MATCHED TO SCREENSHOT: v3_FacilityContacts.js
            const { renderFacilityContacts } = await import('../views/v3_FacilityContacts.js');
            await renderFacilityContacts(context);
        } 
        else if (view === 'pending_projects' || view === 'pendingProjects') {
            // MATCHED TO SCREENSHOT: v4_pendingProjects.js
            const { renderPendingProjects } = await import('../views/v4_pendingProjects.js');
            await renderPendingProjects(context);
        }
        else if (view === 'facility_issues' || view === 'facilityIssues') {
            // MATCHED TO SCREENSHOT: v5_FacilityIssues.js
            const { renderFacilityIssues } = await import('../views/v5_FacilityIssues.js');
            await renderFacilityIssues(context);
        }
        else if (view === 'facility_images' || view === 'facilityImages') {
            // MATCHED TO SCREENSHOT: v6_FacilityImages.js
            const { renderFacilityImages } = await import('../views/v6_FacilityImages.js');
            await renderFacilityImages(context);
        }
        else if (view === 'issue_followups' || view === 'issueFollowups') {
            // MATCHED TO SCREENSHOT: v7_issueFollowups.js
            const { renderIssueFollowups } = await import('../views/v7_issueFollowups.js');
            await renderIssueFollowups(context);
        }
        else if (view === 'facility_reports' || view === 'facilityReports') {
            // MATCHED TO SCREENSHOT: v8_reports.js
            const { renderReports } = await import('../views/v8_reports.js');
            await renderReports(context);
        }
        else {
            console.warn(`View "${view}" not recognized. Defaulting to dashboard.`);
            const { renderFacilities } = await import('../views/v1_facilitiesDashboard.js');
            await renderFacilities();
        }
    } catch (err) {
        console.error("Navigation Error:", err);
        app.innerHTML = `
            <div style="padding:40px; text-align:center; font-family:Arial;">
                <h2 style="color:#dc2625;">Navigation Error</h2>
                <p style="color:#4b5563;">File path mismatch in <b>${view}</b>.</p>
                <p style="font-size:0.8em; color:#9ca3af;">Check casing: e.g., v2_facilityControls (Capital C)</p>
                <button onclick="location.reload()" style="margin-top:15px; padding:10px 20px; background:#00264d; color:white; border:none; border-radius:6px; cursor:pointer;">Reload App</button>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.navigateTo('dashboard');
});
