/* =================================================
FILE: js/main.js
PURPOSE: Router for View 1, 2, 3, 4, 5, and 6
UPDATED: 2026-05-29 09:05:00 AM

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

import { supabase } from './supabaseClient.js'; // Ensure import is present
import { renderFacilities } from '../views/v1_facilitiesDashboard.js';
import { renderFacilityControls } from '../views/v2_facilityControls.js';
import { renderContacts as renderFacilityContacts } from '../views/v3_FacilityContacts.js';
import { renderPendingProjects } from '../views/v4_pendingProjects.js';
import { renderFacilityIssues } from '../views/v5_FacilityIssues.js';
import { renderFacilityImages } from '../views/v6_FacilityImages.js';

// Global persistent Supabase channel for facility project issues
window.facilityIssuesChannel = supabase
  .channel('public:facility_project_issues')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'FACILITY_PROJECT_ISSUES' },
    (payload) => {
        // Call refresh function if defined
        if (window.refreshFacilityBadges) {
            window.refreshFacilityBadges(payload.new.project_id);
        }
    }
  )
  .subscribe();

// Navigation function
window.navigateTo = (view, data = null) => {
    const app = document.getElementById('app');
    if (!app) {
        console.error("Critical Error: Element with ID 'app' not found.");
        return;
    }
    
    app.innerHTML = '';
    app.style.backgroundColor = ''; 

    console.log(`Navigating to: ${view}`, data);

    if (view === 'dashboard') {
        renderFacilities();
    } 
    else if (view === 'facilityControls') {
        renderFacilityControls(data);
    } 
    else if (view === 'facilityContacts' || view === 'facilityInfo') { 
        renderFacilityContacts(data);
    } 
    else if (view === 'pendingProjects') {
        renderPendingProjects(data);
    }
    else if (view === 'facilityIssues') {
        renderFacilityIssues(data);
    }
    else if (view === 'facilityImages') {
        renderFacilityImages(data);
    }
    else {
        console.warn(`View "${view}" not recognized. Defaulting to dashboard.`);
        renderFacilities();
    }
};

// Initial start
document.addEventListener('DOMContentLoaded', () => {
    renderFacilities();
});

// --- VER TAG ---
console.log("Updated: 2026-05-29 09:05 AM • main.js");
