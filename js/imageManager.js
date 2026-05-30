/* =================================================
FILE: js/imageManager.js
PURPOSE: Shared Image Management (Uploads & Previews)
UPDATED: 2026-05-30 11:15:00 AM

STRICT HEADER RULE:
Do not ever remove or change this header section.
Always keep the header at the top of current files and new files.
================================================= */

import { supabase } from './supabaseClient.js';

const IMAGE_BUCKET = 'facility-images';

/**
 * Provides the global CSS for the Image Manager.
 * In the Split-File architecture, this is called by the _grid.js file.
 */
export function getImageManagerStyles() {
    return `
        <style>
            .image-manager-wrap { margin-top: 14px; border-top:1px solid #e5e7eb; padding-top:12px; }
            .image-manager-title { font-size:15px; font-weight:900; color:#00264d; margin:0 0 10px 0; text-transform:uppercase; }
            .image-manager-list { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:10px; }
            .image-manager-card { width:130px; background:#f8fafc; border:1px solid #d1d5db; border-radius:8px; padding:8px; text-align:left; box-sizing:border-box; }
            .image-manager-preview { width:100%; height:90px; object-fit:cover; border-radius:6px; background:#e5e7eb; display:block; margin-bottom:6px; }
            .image-manager-name { font-size:12px; font-weight:bold; color:#111827; margin-bottom:4px; word-break:break-word; }
            .image-manager-notes { font-size:11px; color:#4b5563; margin-bottom:6px; word-break:break-word; }
            .image-manager-open, .image-manager-delete { display:block; width:100%; color:white; text-align:center; text-decoration:none; padding:7px; border-radius:5px; font-size:12px; font-weight:bold; border:none; cursor:pointer; margin-top:5px; }
            .image-manager-open { background:#007bff; }
            .image-manager-delete { background:#dc2626; }
            .image-manager-add-btn { background:#28a745; color:white; border:none; padding:9px 14px; border-radius:7px; font-weight:bold; cursor:pointer; }
            .image-manager-hidden-file { display:none; }
            .image-manager-status { display:none; margin-top:8px; font-size:12px; font-weight:bold; color:#00264d; text-align:center; }
        </style>
    `;
}

/**
 * Main Render Function
 * Target: The "image-manager-mount" div inside your _modal.js or _grid.js
 */
export function renderImageManagerSection(firstArg, relatedTypeArg, relatedIdArg, optionsArg = {}) {
    const { container, facility, relatedType, relatedId, title, hideFirstImage, tempQueue } = normalizeImageManagerArgs(firstArg, relatedTypeArg, relatedIdArg, optionsArg);

    if (!container) { console.error('Image manager container not found.'); return; }

    if (!facility?.id || !relatedType || !relatedId) {
        container.innerHTML = '<div style="padding: 10px; color: #dc2626;">Image setup missing facility information.</div>';
        return;
    }

    const safeId = `${relatedType}_${relatedId}`.replace(/[^a-zA-Z0-9_]/g, '_');

    container.innerHTML = `
        ${getImageManagerStyles()}
        <div class="image-manager-wrap">
            <h3 class="image-manager-title">${safeText(title)}</h3>
            <button id="addImage_${safeId}" class="image-manager-add-btn">Add Image</button>
            <input type="file" id="imageFile_${safeId}" class="image-manager-hidden-file" accept="image/*" capture="environment">
            <div id="imageStatus_${safeId}" class="image-manager-status"></div>
            <div id="imageList_${safeId}" class="image-manager-list">
                <div style="padding: 10px; color: #666; font-style: italic;">Loading images...</div>
            </div>
        </div>
    `;

    const fileInput = document.getElementById(`imageFile_${safeId}`);
    const status = document.getElementById(`imageStatus_${safeId}`);
    const addButton = document.getElementById(`addImage_${safeId}`);

    addButton.onclick = () => { status.style.display='none'; fileInput.value=''; fileInput.click(); };

    fileInput.onchange = async () => {
        const selectedFile = fileInput.files && fileInput.files[0];
        if (!selectedFile) return;

        addButton.disabled = true;
        status.innerText = 'Uploading image...';
        status.style.display = 'block';
        
        const filePath = `facility_${facility.id}/${Date.now()}_${cleanFileName(selectedFile.name)}`;
        
        try {
            const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(filePath, selectedFile);
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
            const imageUrl = publicUrlData?.publicUrl || '';

            const payload = { 
                facility_id: facility.id, 
                related_type: relatedType, 
                related_id: relatedId, 
                image_url: imageUrl, 
                image_path: filePath, 
                image_name: selectedFile.name || 'Image' 
            };

            const { error } = await supabase.from('FACILITY_IMAGES').insert([payload]);
            if (error) throw error;

            status.innerText='Image saved.';
            await loadImagesIntoSection(facility.id, relatedType, relatedId, `imageList_${safeId}`, safeId, { hideFirstImage });
        } catch (err) {
            console.error(err);
            status.innerText='Error handling image.';
        } finally {
            addButton.disabled = false;
        }
    };

    loadImagesIntoSection(facility.id, relatedType, relatedId, `imageList_${safeId}`, safeId, { hideFirstImage });
}

// Helpers (Internal Use)
function normalizeImageManagerArgs(firstArg, relatedTypeArg, relatedIdArg, optionsArg = {}) {
    if (firstArg && typeof firstArg === 'object' && !firstArg.nodeType && !firstArg.tagName) {
        const options = firstArg;
        const container = options.container || document.getElementById(options.containerId);
        const relatedType = options.relatedType || 'facility';
        const relatedId = options.relatedId || options.facility?.id;
        const facility = options.facility || { id: relatedId };
        return { container, facility, relatedType, relatedId, title: options.title || 'Images', hideFirstImage: options.hideFirstImage === true, tempQueue: options.tempQueue };
    }
    const container = typeof firstArg === 'string' ? document.getElementById(firstArg) : firstArg;
    const relatedType = relatedTypeArg || 'facility';
    const relatedId = relatedIdArg;
    const facility = optionsArg?.facility || { id: relatedType === 'facility' ? relatedId : optionsArg?.facilityId };
    return { container, facility, relatedType, relatedId, title: optionsArg?.title || 'Images', hideFirstImage: optionsArg?.hideFirstImage === true, tempQueue: optionsArg?.tempQueue };
}

function cleanFileName(fileName) {
    return (fileName || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function safeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

export async function loadImagesIntoSection(facilityId, relatedType, relatedId, listElementId, safeId='', options={}) {
    const list = document.getElementById(listElementId);
    if (!list) return;

    const { data, error } = await supabase.from('FACILITY_IMAGES')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('related_type', relatedType)
        .eq('related_id', relatedId)
        .order('created_at', { ascending: true });

    if (error) { list.innerHTML='Error.'; return; }

    let images = (data || []).reverse();
    if (!images.length) { list.innerHTML='<div style="font-size:12px; color:#666;">No images found.</div>'; return; }

    list.innerHTML = images.map(img => `
        <div class="image-manager-card">
            <img src="${safeText(img.image_url)}" class="image-manager-preview">
            <div class="image-manager-name">${safeText(img.image_name)}</div>
            <a href="${safeText(img.image_url)}" target="_blank" class="image-manager-open">Open</a>
        </div>
    `).join('');
}
