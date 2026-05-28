/* =================================================
FILE: js/imageManager.js
UPDATED: 2026-05-28 11:35:00 PM

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

import { supabase } from './supabaseClient.js';

const IMAGE_BUCKET = 'facility-images';

export function getImageManagerStyles() {
    return `
        <style>
            .image-manager-wrap {
                margin-top: 14px;
                border-top: 1px solid #e5e7eb;
                padding-top: 12px;
            }

            .image-manager-title {
                font-size: 15px;
                font-weight: 900;
                color: #00264d;
                margin: 0 0 10px 0;
                text-transform: uppercase;
            }

            .image-manager-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
                margin-top: 10px;
            }

            .image-manager-card {
                width: 130px;
                background: #f8fafc;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 8px;
                text-align: left;
                box-sizing: border-box;
            }

            .image-manager-preview {
                width: 100%;
                height: 90px;
                object-fit: cover;
                border-radius: 6px;
                background: #e5e7eb;
                display: block;
                margin-bottom: 6px;
            }

            .image-manager-name {
                font-size: 12px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 4px;
                word-break: break-word;
            }

            .image-manager-notes {
                font-size: 11px;
                color: #4b5563;
                margin-bottom: 6px;
                word-break: break-word;
            }

            .image-manager-open,
            .image-manager-delete {
                display: block;
                width: 100%;
                color: white;
                text-align: center;
                text-decoration: none;
                padding: 7px;
                border-radius: 5px;
                box-sizing: border-box;
                font-size: 12px;
                font-weight: bold;
                border: none;
                cursor: pointer;
                margin-top: 5px;
            }

            .image-manager-open {
                background: #007bff;
            }

            .image-manager-delete {
                background: #dc2626;
            }

            .image-manager-add-btn {
                background: #28a745;
                color: white;
                border: none;
                padding: 9px 14px;
                border-radius: 7px;
                font-weight: bold;
                cursor: pointer;
            }

            .image-manager-hidden-file {
                display: none;
            }

            .image-manager-modal {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                justify-content: center;
                align-items: center;
                z-index: 3000;
            }

            .image-manager-box {
                background: white;
                padding: 20px;
                border-radius: 12px;
                width: 90%;
                max-width: 400px;
                text-align: left;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            }

            .image-manager-status {
                display: none;
                margin-top: 8px;
                font-size: 12px;
                font-weight: bold;
                color: #00264d;
                text-align: center;
            }
        </style>
    `;
}

function normalizeImageManagerArgs(firstArg, relatedTypeArg, relatedIdArg, optionsArg = {}) {
    if (firstArg && typeof firstArg === 'object' && !firstArg.nodeType && !firstArg.tagName) {
        const options = firstArg;
        const container = options.container || document.getElementById(options.containerId);
        const relatedType = options.relatedType || 'facility';
        const relatedId = options.relatedId || options.facility?.id;
        const facility = options.facility || { id: relatedId };

        return {
            container,
            facility,
            relatedType,
            relatedId,
            title: options.title || 'Images',
            hideFirstImage: options.hideFirstImage === true
        };
    }

    const container = typeof firstArg === 'string' ? document.getElementById(firstArg) : firstArg;
    const relatedType = relatedTypeArg || 'facility';
    const relatedId = relatedIdArg;
    const facility = optionsArg?.facility || { id: relatedType === 'facility' ? relatedId : optionsArg?.facilityId };

    return {
        container,
        facility,
        relatedType,
        relatedId,
        title: optionsArg?.title || 'Images',
        hideFirstImage: optionsArg?.hideFirstImage === true
    };
}

function cleanFileName(fileName) {
    const name = fileName || 'facility-image.jpg';
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function safeText(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function renderImageManagerSection(firstArg, relatedTypeArg, relatedIdArg, optionsArg = {}) {
    const {
        container,
        facility,
        relatedType,
        relatedId,
        title,
        hideFirstImage
    } = normalizeImageManagerArgs(firstArg, relatedTypeArg, relatedIdArg, optionsArg);

    if (!container) {
        console.error('Image manager container not found.');
        return;
    }

    if (!facility?.id || !relatedType || !relatedId) {
        container.innerHTML = '<div style="padding: 10px; color: #dc2626;">Image setup missing facility information.</div>';
        return;
    }

    const safeId = `${relatedType}_${relatedId}`.replace(/[^a-zA-Z0-9_]/g, '_');

    container.innerHTML = `
        ${getImageManagerStyles()}

        <div class="image-manager-wrap">
            <h3 class="image-manager-title">${safeText(title)}</h3>

            <button id="addImage_${safeId}" class="image-manager-add-btn">
                Add Image
            </button>

            <input 
                type="file" 
                id="imageFile_${safeId}" 
                class="image-manager-hidden-file"
                accept="image/*"
                capture="environment"
            >

            <div id="imageStatus_${safeId}" class="image-manager-status"></div>

            <div id="imageList_${safeId}" class="image-manager-list">
                <div style="padding: 10px; color: #666; font-style: italic;">Loading images...</div>
            </div>
        </div>

        <div id="deleteImageModal_${safeId}" class="image-manager-modal">
            <div class="image-manager-box" style="text-align:center;">
                <h3 style="margin-top:0; color:#dc2626;">Delete Image</h3>
                <p>Are you sure you want to delete this image?</p>
                <input type="hidden" id="deleteImageId_${safeId}">
                <input type="hidden" id="deleteImagePath_${safeId}">

                <button id="confirmDeleteImage_${safeId}" style="width: 100%; background: #dc2626; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 8px;">
                    Delete
                </button>

                <button id="cancelDeleteImage_${safeId}" style="width: 100%; background: #eee; color: #333; border: none; padding: 12px; border-radius: 8px; margin-top: 10px; cursor: pointer;">
                    Cancel
                </button>
            </div>
        </div>
    `;

    document.getElementById(`addImage_${safeId}`).onclick = () => {
        document.getElementById(`imageStatus_${safeId}`).style.display = 'none';
        document.getElementById(`imageFile_${safeId}`).value = '';
        document.getElementById(`imageFile_${safeId}`).click();
    };

    document.getElementById(`imageFile_${safeId}`).onchange = async () => {
        const addButton = document.getElementById(`addImage_${safeId}`);
        const status = document.getElementById(`imageStatus_${safeId}`);
        const fileInput = document.getElementById(`imageFile_${safeId}`);
        const selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

        if (!selectedFile) {
            return;
        }

        addButton.disabled = true;
        status.innerText = 'Uploading image...';
        status.style.display = 'block';

        const filePath = `facility_${facility.id}/${Date.now()}_${cleanFileName(selectedFile.name)}`;

        const { error: uploadError } = await supabase
            .storage
            .from(IMAGE_BUCKET)
            .upload(filePath, selectedFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload image error:', uploadError);
            status.innerText = 'Upload failed.';
            addButton.disabled = false;
            fileInput.value = '';
            return;
        }

        const { data: publicUrlData } = supabase
            .storage
            .from(IMAGE_BUCKET)
            .getPublicUrl(filePath);

        const imageUrl = publicUrlData?.publicUrl || '';

        const payload = {
            facility_id: facility.id,
            related_type: relatedType,
            related_id: relatedId,
            image_url: imageUrl,
            image_path: filePath,
            image_name: selectedFile.name || 'Image',
            image_notes: '',
            uploaded_by: ''
        };

        const { error } = await supabase
            .from('FACILITY_IMAGES')
            .insert([payload]);

        if (error) {
            console.error('Save image error:', error);
            status.innerText = 'Save failed.';
            addButton.disabled = false;
            fileInput.value = '';
            return;
        }

        status.innerText = 'Image saved.';
        addButton.disabled = false;
        fileInput.value = '';

        await loadImagesIntoSection(
            facility.id,
            relatedType,
            relatedId,
            `imageList_${safeId}`,
            safeId,
            { hideFirstImage }
        );
    };

    document.getElementById(`cancelDeleteImage_${safeId}`).onclick = () => {
        document.getElementById(`deleteImageModal_${safeId}`).style.display = 'none';
    };

    document.getElementById(`confirmDeleteImage_${safeId}`).onclick = async () => {
        const imageId = document.getElementById(`deleteImageId_${safeId}`).value;
        const imagePath = document.getElementById(`deleteImagePath_${safeId}`).value;

        if (!imageId) {
            alert('Image ID missing.');
            return;
        }

        if (imagePath) {
            await supabase.storage.from(IMAGE_BUCKET).remove([imagePath]);
        }

        const { error } = await supabase
            .from('FACILITY_IMAGES')
            .delete()
            .eq('id', imageId);

        if (error) {
            console.error('Delete image error:', error);
            alert(error.message || 'Could not delete image.');
            return;
        }

        document.getElementById(`deleteImageModal_${safeId}`).style.display = 'none';

        await loadImagesIntoSection(
            facility.id,
            relatedType,
            relatedId,
            `imageList_${safeId}`,
            safeId,
            { hideFirstImage }
        );
    };

    loadImagesIntoSection(
        facility.id,
        relatedType,
        relatedId,
        `imageList_${safeId}`,
        safeId,
        { hideFirstImage }
    );
}

export async function loadImagesIntoSection(facilityId, relatedType, relatedId, listElementId, safeId = '', options = {}) {
    const list = document.getElementById(listElementId);

    if (!list) {
        console.error(`Image list element not found: ${listElementId}`);
        return;
    }

    const { data, error } = await supabase
        .from('FACILITY_IMAGES')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('related_type', relatedType)
        .eq('related_id', relatedId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Load images error:', error);
        list.innerHTML = '<div style="padding: 10px; color: #dc2626;">Could not load images.</div>';
        return;
    }

    let images = data || [];

    if (options.hideFirstImage === true && images.length > 0) {
        images = images.slice(1);
    }

    images = images.reverse();

    if (!images || images.length === 0) {
        list.innerHTML = '<div style="padding: 10px; color: #666;">No images found.</div>';
        return;
    }

    list.innerHTML = images.map(img => `
        <div class="image-manager-card">
            <img src="${safeText(img.image_url)}" class="image-manager-preview" alt="${safeText(img.image_name || 'Image')}">
            <div class="image-manager-name">${safeText(img.image_name || 'Image')}</div>
            <div class="image-manager-notes">${safeText(img.image_notes || '')}</div>
            <a href="${safeText(img.image_url)}" target="_blank" class="image-manager-open">Open</a>
            <button class="image-manager-delete" data-image-id="${safeText(img.id)}" data-image-path="${safeText(img.image_path || '')}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('.image-manager-delete').forEach(button => {
        button.onclick = () => {
            if (!safeId) {
                alert('Delete modal ID missing.');
                return;
            }

            document.getElementById(`deleteImageId_${safeId}`).value = button.dataset.imageId;
            document.getElementById(`deleteImagePath_${safeId}`).value = button.dataset.imagePath || '';
            document.getElementById(`deleteImageModal_${safeId}`).style.display = 'flex';
        };
    });
}
