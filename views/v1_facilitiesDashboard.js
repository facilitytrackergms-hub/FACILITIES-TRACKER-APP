/* =================================================
FILE: views/v1_facilitiesDashboard.js
UPDATED: 2026-05-28 11:10:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.

STRICT FILE RULES:
1. Always output the full, complete file content.
2. NEVER ask the user to "find and replace" or manually edit code.
3. Do NOT change code, logic, or styling unless explicitly requested.
4. Keep the file exactly as it is, only applying the requested updates.
5. WE CANNOT CREATE EMPTY FILES. Validation is required.
6. Always update the visible version tag for every touched view/file, including V1. If any code update affects the app, update the visible bottom version label with the current date, time, and exact file name.

GITHUB PUSH RULE:
1. Never do full-file replacement when pushing directly to GitHub unless the file is small and the change is simple.
2. Fetch the current file from GitHub first.
3. Make the smallest possible code change.
4. Push only the targeted section that needs the update.
5. If a full-file replacement is needed, create/download the full file for manual upload instead of pushing the whole file through the GitHub tool.
6. Never touch unrelated files or unrelated sections.
7. Always confirm whether the push succeeded or failed.
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
            .facility-btn { width: 100%; height: 60px; border-radius: 10px; background-color: #003366; color: white; border: none; cursor: pointer; font-weight: bold; font-size: 1.1em; }
            .new-btn { background-color: #28a745; margin-bottom: 20px; width: 200px; }
            .dash-title { font-size: 1.25em; font-weight: 900; color: #003366; margin-bottom: 10px; text-transform: uppercase; border-bottom: 4px solid #003366; padding-bottom: 15px; display: inline-block; width: 90%; white-space: nowrap; }
            .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10; overflow-y: auto; }
            .modal-content { position: relative; top: 10%; left: 50%; transform: translateX(-50%); width: 85%; max-width: 400px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); margin-bottom: 50px; }
            input { display: block; width: 90%; margin: 10px auto; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
            .warning-modal { display: none; position: fixed; inset: 0; background: rgba(255,0,0,0.2); z-index: 20; }
            .warning-content { position: absolute; top: 30%; left: 50%; transform: translateX(-50%); background: white; padding: 25px; border-radius: 8px; border: 2px solid #dc3545; text-align: center; max-width: 300px; }
            .warning-content h4 { color: #dc3545; margin-top: 0; }
            .warning-btn { background: #dc3545; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; margin-top: 15px; }
            #post-save-images { display: none; margin-top: 20px; padding-top: 15px; border-top: 2px solid #eee; }
        </style>
    `;

    app.innerHTML = `
        ${styles}
        <div class="dash-container">
            <div class="dash-card">
                <h1 class="dash-title">FACILITIES DASHBOARD</h1>
                <br>
                <button id="openModal" class="facility-btn new-btn">Create New Facility</button>
                <div id="list" class="button-container">Loading...</div>
            </div>
            
            <div id="modal" class="modal-overlay">
                <div class="modal-content">
                    <h3 id="modalTitle">Add New Facility</h3>

                    <div id="facility-fields">
                        <input type="text" id="name" placeholder="Facility Name">
                        <input type="text" id="address" placeholder="Address">
                        <input type="text" id="phone" placeholder="Phone">

                        <button id="prepareImageBtn" class="facility-btn" style="background:#f5c400; color:#111; width:90%; margin: 20px auto 0 auto;">
                            Add/Delete Facility Image
                        </button>
                    </div>

                    <div id="post-save-images">
                        <p style="font-weight: bold; color: #28a745; margin-bottom: 10px;">Facility Saved. Add or Delete Image Below:</p>
                        <div id="image-manager-mount"></div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                        <button id="saveBtn" class="facility-btn new-btn" style="width:90%; margin: 0 auto;">Save Facility</button>
                        <button id="closeModal" class="facility-btn" style="background:#666; width:90%; margin: 0 auto;">Close</button>
                    </div>
                </div>
            </div>

            <div id="warningModal" class="warning-modal">
                <div class="warning-content">
                    <h4>Missing Information</h4>
                    <p id="warningText">All fields are required before adding the facility image.</p>
                    <button id="closeWarning" class="warning-btn">OK</button>
                </div>
            </div>

            <div style="margin-top: 50px; font-size: 0.8em; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
                File: v1_facilitiesDashboard.js | Updated: 2026-05-28 11:10:00 PM
            </div>
        </div>
    `;

    const modal = document.getElementById('modal');
    const warningModal = document.getElementById('warningModal');
    const imageMount = document.getElementById('image-manager-mount');
    const imageSection = document.getElementById('post-save-images');
    const saveBtn = document.getElementById('saveBtn');
    const facilityFields = document.getElementById('facility-fields');
    let createdFacility = null;

    document.getElementById('openModal').onclick = () => {
        createdFacility = null;
        modal.style.display = 'block';
        imageSection.style.display = 'none';
        facilityFields.style.display = 'block';
        saveBtn.style.display = 'block';
        imageMount.innerHTML = '';
        document.getElementById('modalTitle').innerText = "Add New Facility";
        document.getElementById('name').value = '';
        document.getElementById('address').value = '';
        document.getElementById('phone').value = '';
    };

    document.getElementById('closeModal').onclick = () => {
        modal.style.display = 'none';
        renderFacilities();
    };

    document.getElementById('closeWarning').onclick = () => warningModal.style.display = 'none';

    async function saveFacilityAndOpenImages() {
        if (createdFacility && createdFacility.id) {
            facilityFields.style.display = 'none';
            saveBtn.style.display = 'none';
            document.getElementById('modalTitle').innerText = "Facility Image: " + createdFacility.Name;
            imageSection.style.display = 'block';
            imageMount.innerHTML = '';
            renderImageManagerSection(imageMount, 'facility', createdFacility.id, { title: 'Facility Image' });
            return;
        }

        const name = document.getElementById('name').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!name || !address || !phone) {
            warningModal.style.display = 'block';
            return;
        }

        const { data: newFacility, error } = await supabase
            .from('FACILITIES')
            .insert([{ Name: name, Address: address, Phone: phone }])
            .select();

        if (error) {
            console.error("Database Error:", error);
            return;
        }

        if (newFacility && newFacility[0]) {
            createdFacility = newFacility[0];
            facilityFields.style.display = 'none';
            saveBtn.style.display = 'none';
            document.getElementById('modalTitle').innerText = "Facility Image: " + name;
            imageSection.style.display = 'block';
            imageMount.innerHTML = '';
            renderImageManagerSection(imageMount, 'facility', createdFacility.id, { title: 'Facility Image' });
        }
    }

    document.getElementById('prepareImageBtn').onclick = saveFacilityAndOpenImages;
    saveBtn.onclick = saveFacilityAndOpenImages;

    const { data } = await supabase.from('FACILITIES').select('*');
    const list = document.getElementById('list');
    list.innerHTML = '';

    if (data) {
        data.forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'facility-btn';
            btn.textContent = f.Name;
            btn.onclick = () => window.navigateTo('facilityControls', f);
            list.appendChild(btn);
        });
    }
}
