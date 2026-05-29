/* =================================================
FILE: views/v6_FacilityImages.js
UPDATED: 2026-05-28 10:45:00 PM

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

import { renderImageManagerSection } from '../js/imageManager.js';

export async function renderFacilityImages(data) {
    const app = document.getElementById('app');
    if (!app) return;

    // Unpack unified payload container or fallback safely
    const facility = data?.facility ? data.facility : data;

    app.innerHTML = `
        <div style="padding:20px; font-family:Arial; background:#f3f4f6; min-height:100vh; text-align:center;">
            <h1 style="color:#00264d; margin-top:0; margin-bottom:8px; font-size:28px; font-weight:900;">
                FACILITY GALLERY
            </h1>

            <div style="font-size:18px; font-weight:bold; color:#64748b; margin-bottom:20px;">
                ${facility?.Name || ''}
            </div>

            <div id="galleryImageManager" style="background:white; border-radius:18px; padding:15px; box-shadow:0 4px 14px rgba(0,0,0,0.08); max-width:700px; margin:0 auto;"></div>

            <button id="backBtn" style="margin-top:25px; width:100%; max-width:320px; padding:14px; background:#6b7280; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">
                BACK TO CONTROLS
            </button>

            <div style="margin-top:40px; font-size:10px; color:#94a3b8; border-top:1px solid #e5e7eb; padding-top:10px;">
                File: v6_FacilityImages.js | Updated: 2026-05-28 10:45:00 PM
            </div>
        </div>
    `;

    const wrapper = document.getElementById('galleryImageManager');

    if (!facility || !facility.id) {
        wrapper.innerHTML = '<div style="padding:20px; color:red;">Facility information missing.</div>';
        return;
    }

    // Mount image manager utilizing unified context architecture
    renderImageManagerSection(wrapper, 'facility', facility.id, { facility });

    document.getElementById('backBtn').onclick = () => {
        if (window.navigateTo) {
            window.navigateTo('facilityControls', { facility });
        }
    };
}
