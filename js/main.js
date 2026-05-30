/* =================================================
FILE: js/main.js
PURPOSE: Router for View 1, 2, 3, 4, 5, 6, 7, and 8
UPDATED: 2026-05-29 11:45:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

// We use Dynamic Imports (await import) inside navigateTo to prevent 404s on startup
// and to support the new lowercase folder architecture.

window.navigateTo = async (view, context = null) => {
    const app = document.getElementById('app');
    if (!app) {
        console.error("Critical Error: Element with ID 'app' not found.");
        return;
    }
    
    // Show a brief loading state while modules fetch
    app.innerHTML = '<div style="text-align:center; padding:50px; color:#64748b; font-family:Arial;">Loading...</div>';
    app.style.backgroundColor = ''; 

    console.log(`Navigating to: ${view}`, context);

    try {
        if (view === 'dashboard' || view === 'facility_dashboard') {
            const { renderFacilitiesDashboard } = await import('../v1_facility_dashboard/dashboard_v1_grid.js');
            await renderFacilitiesDashboard();
        } 
        else if (view === 'facility_controls' || view === 'facilityControls') {
            const { renderFacilityControls } = await import('../v2_facility_controls/controls_v2_grid.js');
            await renderFacilityControls(context);
        } 
        else if (view === 'facility_contacts' || view === 'facilityContacts') {
            const { renderFacilityContacts } = await import('../v3_facility_contacts/contacts_v3_grid.js');
            await renderFacilityContacts(context);
        } 
        else if (view === 'pending_projects' || view === 'pendingProjects') {
            const { renderPendingProjects } = await import('../v4_pending_projects/projects_v4_grid.js');
            await renderPendingProjects(context);
        }
        else if (view === 'facility_issues' || view === 'facilityIssues') {
            const { renderFacilityIssues } = await import('../v5_facility_issues/issues_v5_grid.js');
            await renderFacilityIssues(context);
        }
        else if (view === 'facility_images' || view === 'facilityImages') {
            const { renderFacilityImages } = await import('../v6_facility_images/images_v6_grid.js');
            await renderFacilityImages(context);
        }
        else if (view === 'issue_followups' || view === 'issueFollowups') {
            const { renderIssueFollowups } = await import('../v7_issue_followups/followups_v7_grid.js');
            await renderIssueFollowups(context);
        }
        else if (view === 'facility_reports' || view === 'facilityReports') {
            const { renderReports } = await import('../v8_reports/reports_v8_grid.js');
            await renderReports(context);
        }
        else {
            console.warn(`View "${view}" not recognized. Defaulting to dashboard.`);
            const { renderFacilitiesDashboard } = await import('../v1_facility_dashboard/dashboard_v1_grid.js');
            await renderFacilitiesDashboard();
        }
    } catch (err) {
        console.error("Navigation Error:", err);
        app.innerHTML = `
            <div style="padding:40px; text-align:center; font-family:Arial;">
                <h2 style="color:#dc2625;">Navigation Error</h2>
                <p style="color:#4b5563;">Could not load the requested view. This is usually due to a missing file or folder.</p>
                <button onclick="location.reload()" style="padding:10px 20px; background:#00264d; color:white; border:none; border-radius:6px; cursor:pointer;">Reload App</button>
            </div>
        `;
    }
};

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    // Default starting point: Dashboard
    // If you want to force a specific view for testing, change 'dashboard' to 'facility_contacts'
    window.navigateTo('dashboard');
});
