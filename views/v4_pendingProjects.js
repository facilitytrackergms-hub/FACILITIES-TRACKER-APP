/* =================================================
FILE: views/v4_pendingProjects.js
UPDATED: 2026-05-28 12:40:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.

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

export async function renderPendingProjects(facility) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; font-family: Arial; background: #f3f4f6; min-height: 100vh;">
            <h1 style="color: #00264d; margin-bottom: 10px;">PENDING PROJECTS</h1>
            <p style="color: #64748b; margin-bottom: 30px;">Facility: <strong>${facility.Name}</strong></p>

            <div style="display: flex; flex-direction: column; gap: 15px; max-width: 400px; margin: 0 auto;">
                <button id="addNewProjectBtn" style="padding: 20px; background: #28a745; color: white; font-weight: bold; border: none; border-radius: 12px; cursor: pointer; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    ADD OR VIEW PROJECTS
                </button>
                
                <button id="backToHub2" style="padding: 15px; background: #00264d; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; margin-top: 20px;">BACK TO CONTROLS</button>
            </div>
            
            <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 10px;">File: v4_pendingProjects.js | Updated: 2026-05-28 12:40:00 PM</div>
        </div>
    `;

    // Navigation logic
    document.getElementById('addNewProjectBtn').onclick = () => {
        if (window.navigateTo) {
            window.navigateTo('facilityIssues', facility);
        }
    };

    document.getElementById('backToHub2').onclick = () => {
        if (window.navigateTo) {
            window.navigateTo('facilityControls', facility);
        }
    };
}
