/* =================================================
FILE: reports_v8_modal.js
PURPOSE: Handle Report Filtering, Exporting, and Print Settings
UPDATED: 2026-05-29 11:40:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep this header at the top of current files and new files.
================================================= */

export function openReportSettingsModal(facility, onApplyFilters) {
    // Logic for report customization (e.g., Date Range, Status Filter)
    const modalHtml = `
        <div id="reportsModal" style="position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:2000; display:flex; justify-content:center; align-items:center; padding:20px;">
            <div style="background:white; padding:25px; border-radius:16px; width:100%; max-width:400px; text-align:left; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top:0; color:#00264d; border-bottom:2px solid #f5c400; padding-bottom:10px;">Report Settings</h3>
                
                <label style="display:block; font-size:12px; font-weight:bold; color:#666; margin-top:20px;">INCLUSION RULES</label>
                <div style="margin-top:10px;">
                    <label style="display:flex; align-items:center; gap:8px; font-size:14px; margin-bottom:8px;">
                        <input type="checkbox" checked id="incFollowups"> Include Follow-up Logs
                    </label>
                    <label style="display:flex; align-items:center; gap:8px; font-size:14px; margin-bottom:8px;">
                        <input type="checkbox" checked id="incImages"> Include Photos
                    </label>
                </div>

                <div style="display:flex; gap:10px; margin-top:30px;">
                    <button id="printReportBtn" style="flex:1; padding:12px; background:#00264d; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">PRINT / PDF</button>
                    <button id="closeReportsModal" style="flex:1; padding:12px; background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer;">CLOSE</button>
                </div>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = modalHtml;
    document.body.appendChild(container);

    document.getElementById('closeReportsModal').onclick = () => container.remove();

    document.getElementById('printReportBtn').onclick = () => {
        window.print();
    };
}

/**
 * Helper to format report dates for the UI
 */
export function formatDateRange(startDate, endDate) {
    return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
}
