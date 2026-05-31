/* =================================================
FILE: js/main.js
PURPOSE: Router for Facility Tracker Views
UPDATED: 2026-06-01 08:15:00 AM
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
        switch(view) {
            case 'dashboard':
            case 'facility_dashboard': {
                try {
                    const module = await import('../views/v1_facilitiesDashboard.js');
                    await module.renderFacilities();
                } catch(e) {
                    console.error('Error importing v1_facilitiesDashboard.js', e);
                    throw e;
                }
                break;
            }

            case 'facility_controls':
            case 'facilityControls': {
                try {
                    const module = await import('../views/v2_facilityControls.js');
                    await module.renderFacilityControls(context);
                } catch(e) {
                    console.error('Error importing v2_facilityControls.js', e);
                    throw e;
                }
                break;
            }

            case 'facility_contacts':
            case 'facilityContacts': {
                try {
                    const module = await import('../views/v3_FacilityContacts.js');
                    await module.renderContacts(context);
                } catch(e) {
                    console.error('Error importing v3_FacilityContacts.js', e);
                    throw e;
                }
                break;
            }

            case 'pending_projects':
            case 'pendingProjects': {
                try {
                    const module = await import('../views/v4_pendingProjects.js');
                    await module.renderPendingProjects(context);
                } catch(e) {
                    console.error('Error importing v4_pendingProjects.js', e);
                    throw e;
                }
                break;
            }

            case 'facility_issues':
            case 'facilityIssues': {
                try {
                    const module = await import('../views/v5_FacilityIssues.js');
                    await module.renderFacilityIssues(context);
                } catch(e) {
                    console.error('Error importing v5_FacilityIssues.js', e);
                    throw e;
                }
                break;
            }

            case 'facility_images':
            case 'facilityImages': {
                try {
                    const module = await import('../views/v6_FacilityImages.js');
                    await module.renderFacilityImages(context);
                } catch(e) {
                    console.error('Error importing v6_FacilityImages.js', e);
                    throw e;
                }
                break;
            }

            case 'issue_followups':
            case 'issueFollowups': {
                try {
                    const module = await import('../views/v7_issueFollowups.js');
                    await module.renderIssueFollowups(context);
                } catch(e) {
                    console.error('Error importing v7_issueFollowups.js', e);
                    throw e;
                }
                break;
            }

            case 'facility_reports':
            case 'facilityReports': {
                try {
                    const module = await import('../views/v8_reports.js');
                    await module.renderReports(context);
                } catch(e) {
                    console.error('Error importing v8_reports.js', e);
                    throw e;
                }
                break;
            }

            default: {
                console.warn(`View "${view}" not recognized. Defaulting to dashboard.`);
                const module = await import('../views/v1_facilitiesDashboard.js');
                await module.renderFacilities();
            }
        }
    } catch (err) {
        console.error("Navigation Error:", err);
        app.innerHTML = `
            <div style="padding:40px; text-align:center; font-family:Arial;">
                <h2 style="color:#dc2625;">Navigation Error</h2>
                <p style="color:#4b5563;">Check the import or syntax of <b>${view}</b>.</p>
                <p style="font-size:0.8em; color:#9ca3af;">${err.message}</p>
                <button onclick="location.reload()" style="margin-top:15px; padding:10px 20px; background:#00264d; color:white; border:none; border-radius:6px; cursor:pointer;">Reload App</button>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.navigateTo('dashboard');
});
