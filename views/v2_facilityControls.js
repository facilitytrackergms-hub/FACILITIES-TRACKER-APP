/* =================================================
FILE: views/v2_facilityControls.js
UPDATED: 2026-05-29 12:00:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep the header at the top of current files and new files.
================================================= */
import { supabase } from '../js/supabaseClient.js';

export async function renderFacilityControls(facility) {
    const app = document.getElementById('app');

    const styles = `
        <style>
            .controls-container { padding: 20px; font-family: Arial, sans-serif; background: #e3f2fd; min-height: 100vh; box-sizing: border-box; }
            .controls-card { background: rgba(255,255,255,0.92); border-radius: 18px; padding: 20px; box-shadow: 0 10px 24px rgba(0,0,0,0.12); max-width: 450px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.8); }
            .back-btn { background: #666; color: white; border: none; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: bold; margin-bottom: 20px; font-size: 1em; width: 100%; max-width: 450px; display: block; margin-left: auto; margin-right: auto; }
            .facility-title { font-size: 1.25em; font-weight: 900; color: #003366; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; border-bottom: 4px solid #003366; padding-bottom: 15px; text-align: center; }
            .info-block { background: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; font-size: 1em; color: #333; border: 1px solid #ccc; text-align: left; }
            .badge-section { margin-top: 20px; text-align: left; }
            .badge-section h3 { color: #003366; font-size: 1.1em; margin-bottom: 10px; text-transform: uppercase; }
            .badge-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; min-height: 30px; }
            .project-badge { background: #003366; color: white; padding: 8px 14px; border-radius: 20px; font-size: 0.9em; font-weight: bold; display: inline-flex; align-items: center; }
            .no-badges { color: #666; font-style: italic; font-size: 0.95em; }
            .add-badge-form { margin-top: 25px; padding-top: 20px; border-top: 2px solid #ccc; text-align: left; }
            .add-badge-form h3 { color: #003366; font-size: 1.1em; margin-bottom: 10px; text-transform: uppercase; }
            .badge-input { display: block; width: 100%; margin: 10px auto; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 1em; }
            .add-btn { width: 100%; height: 50px; border-radius: 10px; background-color: #28a745; color: white; border: none; cursor: pointer; font-weight: bold; font-size: 1.1em; margin-top: 5px; }
        </style>
    `;

    app.innerHTML = `
        ${styles}
        <div class="dash-container">
            <button id="backToDashBtn" class="back-btn">← BACK TO DASHBOARD</button>
            
            <div class="controls-card">
                <h1 class="facility-title">${facility.Name}</h1>
                
                <div class="info-block">
                    <p style="margin: 4px 0;"><strong>Address:</strong> ${facility.Address || 'N/A'}</p>
                    <p style="margin: 4px 0;"><strong>Phone:</strong> ${facility.Phone || 'N/A'}</p>
                    <p style="margin: 4px 0;"><strong>Notes:</strong> ${facility.Notes || 'None'}</p>
                </div>

                <div class="badge-section">
                    <h3>Active Project Badges</h3>
                    <div id="badgeContainer" class="badge-list">Loading badges...</div>
                </div>

                <div class="add-badge-form">
                    <h3>Create New Badge</h3>
                    <input type="text" id="newProjectName" class="badge-input" placeholder="Project Name (e.g., HVAC Install)">
                    <button id="submitBadgeBtn" class="add-btn">Save Project Badge</button>
                </div>
            </div>

            <div style="margin-top: 50px; font-size: 0.8em; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
                File: v2_facilityControls.js | Updated: 2026-05-29 12:00:00 PM
            </div>
        </div>
    `;

    // Navigation Back to Main Dashboard
    document.getElementById('backToDashBtn').onclick = () => {
        if (window.navigateTo) {
            window.navigateTo('facilitiesDashboard');
        } else {
            console.warn("Navigation handler 'window.navigateTo' is missing globally.");
        }
    };

    // Form submission processing
    document.getElementById('submitBadgeBtn').onclick = async () => {
        const input = document.getElementById('newProjectName');
        const projectName = input.value.trim();

        if (!projectName) {
            alert('Please enter a valid project name before saving.');
            return;
        }

        const { error } = await supabase
            .from('FACILITY_PROJECTS')
            .insert([{ 
                facility_id: facility.id, 
                project_name: projectName, 
                active_status: true 
            }]);

        if (error) {
            console.error("Database Write Error:", error);
            alert("Could not save project badge. See developer console.");
        } else {
            input.value = '';
            await loadBadges();
        }
    };

    // Isolated internal data function
    async function loadBadges() {
        const container = document.getElementById('badgeContainer');
        
        const { data: projects, error } = await supabase
            .from('FACILITY_PROJECTS')
            .select('*')
            .eq('facility_id', facility.id)
            .eq('active_status', true);

        if (error) {
            console.error("Database Read Error:", error);
            container.innerHTML = `<span style="color: #dc3545; font-weight: bold;">Failed to sync data components.</span>`;
            return;
        }

        container.innerHTML = '';

        if (!projects || projects.length === 0) {
            container.innerHTML = `<span class="no-badges">No active project badges logged for this property.</span>`;
            return;
        }

        projects.forEach(proj => {
            const badge = document.createElement('span');
            badge.className = 'project-badge';
            badge.textContent = proj.project_name;
            container.appendChild(badge);
        });
    }

    // Execute data fetch sequence on view mount
    await loadBadges();
}
