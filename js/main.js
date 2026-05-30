/* =================================================
FILE: js/main.js
PURPOSE: Router for View 1, 2, 3, 4, 5, 6, 7, and 8
UPDATED: 2026-05-30 08:15:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

// Updated to point to the correct folder "views" and correct filenames.
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
            // FIXED: Path and Function name updated to match v1_facilitiesDashboard.js
            const { renderFacilities } = await import('./views/v1_facilitiesDashboard.js');
            await renderFacilities();
        } 
        else if (view === 'facility_controls' || view === 'facilityControls') {
            // Ensure these files exist in the /views/ folder or update paths accordingly
            const { renderFacilityControls } = await import('./views/v2_facility_controls.js');
            await renderFacilityControls(context);
        } 
        else if (view === 'facility_contacts' || view === 'facilityContacts') {
            const { renderFacilityContacts } = await import('./views/v3_facility_contacts.js');
            await renderFacilityContacts(context);
        } 
        else if (view === 'pending_projects' || view === 'pendingProjects') {
            const { renderPendingProjects } = await import('./views/v4_pending_projects.js');
            await renderPendingProjects(context);
        }
        else if (view === 'facility_issues' || view === 'facilityIssues') {
            const { renderFacilityIssues } = await import('./views/v5_facility_issues.js');
            await renderFacilityIssues(context);
        }
        else if (view === 'facility_images' || view === 'facilityImages') {
            const { renderFacilityImages } = await import('./views/v6_facility_images.js');
            await renderFacilityImages(context);
        }
        else if (view === 'issue_followups' || view === 'issueFollowups') {
            const { renderIssueFollowups } = await import('./views/v7_issue_followups.js');
            await renderIssueFollowups(context);
        }
        else if (view === 'facility_reports' || view === 'facilityReports') {
            const { renderReports } = await import('./views/v8_reports.js');
            await renderReports(context);
        }
        else {
            console.warn(`View "${view}" not recognized. Defaulting to dashboard.`);
            const { renderFacilities } = await import('./views/v1_facilitiesDashboard.js');
            await renderFacilities();
        }
    } catch (err) {
        console.error("Navigation Error:", err);
        app.innerHTML = `
            <div style="padding:40px; text-align:center; font-family:Arial;">
                <h2 style="color:#dc2625;">Navigation Error</h2>
                <p style="color:#4b5563;">Could not load the requested view: <b>${view}</b></p>
                <p style="font-size: 0.8em; color: #9ca3af;">Check if the file exists in the /views/ folder.</p>
                <button onclick="location.reload()" style="padding:10px 20px; background:#00264d; color:white; border:none; border-radius:6px; cursor:pointer;">Reload App</button>
            </div>
        `;
    }
};

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    window.navigateTo('dashboard');
});
