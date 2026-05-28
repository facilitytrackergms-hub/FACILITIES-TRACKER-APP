/* =================================================
FILE: views/v1_facilitiesDashboard.js
UPDATED: 2026-05-29 04:20:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */
import { supabase } from '../js/supabaseClient.js';
import { renderImageManagerSection } from '../js/imageManager.js';

export async function renderFacilities() {
    const app = document.getElementById('app');
    
    const styles = `
        <style>
            .dash-container { padding: 20px; text-align: center; font-family: Arial; background: #e3f2fd; min-height: 100vh; box-sizing: border-box; }
            .dash-card { background: rgba(255,255,255,0.88); border-radius: 18px; padding: 18px 12px 24px; box-shadow: 0 10px 24px rgba(0,0,0,0.12); border: 1px solid rgba(255,255,255,0.8); max-width: 380px; margin: 0 auto; }
            .button-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 10px; max-width: 400px; margin: 0 auto; }
            .facility-btn { width: 100%; height: 60px; border-radius: 10px; background-color: #003366; color: white; border: none; cursor: pointer; font-weight: bold; font-size: 1.1em; position: relative; }
            .badge { position: absolute; top: 5px; right: 8px; background: red; color: white; font-size: 12px; padding: 2px 6px; border-radius: 8px; }
            .new-btn { background-color: #28a745; margin-bottom: 20px; width: 200px; }
            .dash-title { font-size: 1.25em; font-weight: 900; color: #003366; margin-bottom: 10px; text-transform: uppercase; border-bottom: 4px solid #003366; padding-bottom: 15px; display: inline-block; width: 90%; white-space: nowrap; }
            input { display: block; width: 90%; margin: 10px auto; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
        </style>
    `;

    app.innerHTML = `
        ${styles}
        <div class="dash-container">
            <div class="dash-card">
                <h1 class="dash-title">FACILITIES DASHBOARD</h1>
                <input type="text" id="facilitySearch" placeholder="Search facilities...">
                <select id="issueFilter" style="width:90%; margin:10px auto; padding:8px; border-radius:5px;">
                    <option value="all">All</option>
                    <option value="open">Open Issues</option>
                    <option value="closed">No Open Issues</option>
                </select>
                <br>
                <button id="openModal" class="facility-btn new-btn">Create New Facility</button>
                <div id="list" class="button-container">Loading...</div>
            </div>
        </div>
    `;

    const facilitySearch = document.getElementById('facilitySearch');
    const issueFilter = document.getElementById('issueFilter');
    const list = document.getElementById('list');

    async function loadFacilities() {
        const { data: facilities } = await supabase.from('FACILITIES').select('*');
        const { data: openIssues } = await supabase.from('FACILITY_PROJECT_ISSUES').select('id, project_id, open_issue').eq('open_issue', true);

        const issuesCountMap = {};
        if (openIssues) {
            openIssues.forEach(issue => {
                if (issue.project_id) {
                    issuesCountMap[issue.project_id] = (issuesCountMap[issue.project_id] || 0) + 1;
                }
            });
        }

        const searchValue = facilitySearch.value.toLowerCase();
        const filterStatus = issueFilter.value;

        list.innerHTML = '';
        facilities.forEach(f => {
            const count = issuesCountMap[f.id] || 0;
            if (searchValue && !f.Name.toLowerCase().includes(searchValue)) return;
            if (filterStatus === 'open' && count === 0) return;
            if (filterStatus === 'closed' && count > 0) return;

            const btn = document.createElement('button');
            btn.className = 'facility-btn';
            btn.textContent = f.Name;
            if (count > 0) btn.innerHTML += `<span class="badge">${count}</span>`;
            btn.onclick = () => window.navigateTo('facilityControls', f);
            list.appendChild(btn);
        });
    }

    facilitySearch.oninput = loadFacilities;
    issueFilter.onchange = loadFacilities;

    await loadFacilities();
}
