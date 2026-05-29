/* =================================================
FILE: views/v4_pendingProjects.js
UPDATED: 2026-05-28 08:20:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

export async function renderPendingProjects(facility, contact = null) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; font-family: Arial; background: #f3f4f6; min-height: 100vh;">
            <h1 style="color: #00264d; margin-bottom: 10px;">PENDING PROJECTS</h1>
            <p style="color: #64748b; margin-bottom: 30px;">
                Facility: <strong>${facility.Name}</strong>
                ${contact ? ` | Contact: <strong>${contact.name}</strong>` : ''}
            </p>

            <div style="display: flex; flex-direction: column; gap: 15px; max-width: 400px; margin: 0 auto;">
                <button id="addNewProjectBtn" style="padding: 20px; background: #28a745; color: white; font-weight: bold; border: none; border-radius: 12px; cursor: pointer; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    ADD NEW ISSUE
                </button>
                
                <button id="backToHub2" style="padding: 15px; background: #00264d; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; margin-top: 20px;">BACK TO CONTROLS</button>
            </div>
            
            <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                File: v4_pendingProjects.js | Updated: 2026-05-28 08:20:00 PM
            </div>
        </div>
    `;

    // Navigation logic
    document.getElementById('addNewProjectBtn').onclick = () => {
        if (window.navigateTo) {
            // Navigate to facilityIssues view, pass facility and optional contact for linking issue
            window.navigateTo('facilityIssues', facility, contact);
        }
    };

    document.getElementById('backToHub2').onclick = () => {
        if (window.navigateTo) {
            window.navigateTo('facilityControls', facility);
        }
    };
}
