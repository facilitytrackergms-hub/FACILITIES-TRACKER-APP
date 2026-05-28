/* =================================================
FILE: views/v3_FacilityContacts.js
UPDATED: 2026-05-28 02:34:00 PM

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
import { supabase } from '../js/supabaseClient.js';

const IMAGE_BUCKET = 'facility-images';

export async function renderFacilityContacts(facility) {
    const app = document.getElementById('app');
    let pendingContactImageFile = null;
    
    const styles = `
        <style>
            .warning-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 2000; }
            .warning-box { background: white; padding: 20px; border-radius: 10px; border: 2px solid #dc3545; text-align: center; width: 250px; }
            .comm-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1500; }
            .comm-box { background: white; padding: 20px; border-radius: 10px; text-align: center; width: 250px; }
            .comm-btn { display: block; width: 100%; padding: 12px; margin: 8px 0; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; text-decoration: none; color: white; }
            
            .input-field { 
                width: 100%; 
                height: 45px; 
                margin-bottom: 15px; 
                padding: 0 10px; 
                border: 1px solid #ccc; 
                border-radius: 6px; 
                font-size: 16px; 
                box-sizing: border-box; 
            }
            .textarea-field { 
                width: 100%; 
                min-height: 80px; 
                margin-bottom: 15px; 
                padding: 10px; 
                border: 1px solid #ccc; 
                border-radius: 6px; 
                font-size: 16px; 
                box-sizing: border-box; 
            }
            .detail-link {
                color: #007bff;
                text-decoration: none;
                font-weight: bold;
            }
            .detail-row {
                margin-bottom: 12px;
                line-height: 1.4;
            }
            .action-btn {
                width: 100%; 
                border: none; 
                padding: 14px; 
                border-radius: 8px; 
                cursor: pointer; 
                margin-top: 12px;
                font-weight: bold;
                font-size: 15px;
            }
            .contact-photo-add-btn {
                width: 100%;
                background: #28a745;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                margin-bottom: 12px;
            }
            .contact-photo-status {
                display: none;
                font-size: 12px;
                font-weight: bold;
                color: #00264d;
                text-align: center;
                margin-bottom: 12px;
            }
            .contact-detail-header {
                display: flex;
                align-items: center;
                gap: 10px;
                border-bottom: 2px solid #f5c400;
                padding-bottom: 10px;
                margin-bottom: 12px;
            }
            .contact-detail-image {
                width: 54px;
                height: 54px;
                border-radius: 10px;
                overflow: hidden;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .contact-detail-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                cursor: pointer;
            }
            .contact-image-viewer {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.8);
                justify-content: center;
                align-items: center;
                z-index: 2500;
                padding: 18px;
                box-sizing: border-box;
            }
            .contact-image-viewer-box {
                width: 100%;
                max-width: 520px;
                text-align: center;
            }
            .contact-image-viewer-box img {
                width: 100%;
                max-height: 75vh;
                object-fit: contain;
                background: white;
                border-radius: 12px;
            }
            .contact-image-viewer-close {
                width: 100%;
                margin-top: 12px;
                padding: 12px;
                border: none;
                border-radius: 8px;
                background: #f5c400;
                color: #00264d;
                font-weight: bold;
                cursor: pointer;
            }
        </style>
    `;

    app.innerHTML = `
        ${styles}
        <div style="padding: 20px; text-align: center; font-family: Arial;">
            <h1 style="font-size: 1.25em; font-weight: 900; border-bottom: 4px solid #00264d; padding-bottom: 15px; margin-bottom: 25px; text-transform: uppercase;">
                ${facility.Name} - Contacts
            </h1>
            
            <button id="backToHub" style="padding: 10px 20px; background: #00264d; color: white; border: none; border-radius: 8px; margin-bottom: 20px; cursor: pointer;">Back to Controls</button>
            <button id="addContactBtn" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 8px; margin-bottom: 20px; cursor: pointer; margin-left: 10px;">Create New Contact</button>
            
            <div id="contactList" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
                <div style="padding: 20px; color: #666; font-style: italic;">Loading...</div>
            </div>
            
            <div id="contactModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
                <div style="background: white; padding: 25px; border-radius: 12px; width: 90%; max-width: 400px; text-align: left; box-shadow: 0 4px 15px rgba(0,0,0,0.3); max-height: 90vh; overflow-y: auto;">
                    <h3 id="modalTitle" style="margin-top:0; color:#00264d; border-bottom: 2px solid #f5c400; padding-bottom: 10px; margin-bottom: 20px;">New Contact</h3>
                    <input type="hidden" id="cId">
                    
                    <div id="contact-form-fields">
                        <label style="font-size: 12px; color: #666; font-weight: bold;">FULL NAME</label>
                        <input type="text" id="cName" class="input-field" placeholder="e.g. John Smith">
                        
                        <label style="font-size: 12px; color: #666; font-weight: bold;">ROLE</label>
                        <input type="text" id="cRole" list="roleOptions" class="input-field" placeholder="e.g. Manager">
                        <datalist id="roleOptions"></datalist>
                        
                        <label style="font-size: 12px; color: #666; font-weight: bold;">PHONE NUMBER</label>
                        <input type="tel" id="cPhone" class="input-field" placeholder="555-0123">
                        
                        <label style="font-size: 12px; color: #666; font-weight: bold;">E-MAIL</label>
                        <input type="email" id="cEmail" class="input-field" placeholder="name@company.com">
                        
                        <label style="font-size: 12px; color: #666; font-weight: bold;">NOTES</label>
                        <textarea id="cNotes" class="textarea-field" placeholder="Additional details..."></textarea>

                        <button id="pendingContactImageBtn" class="contact-photo-add-btn">Add Contact Image</button>
                        <input type="file" id="pendingContactImageFile" accept="image/*" capture="environment" style="display:none;">
                        <div id="pendingContactImageStatus" class="contact-photo-status"></div>
                    </div>
                    
                    <button id="saveContact" class="action-btn" style="background: #28a745; color: white;">Save to Database</button>
                    <button id="closeModal" class="action-btn" style="background: #eee; color: #333;">Close</button>
                </div>
            </div>

            <div id="detailModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
                <div id="detailContent" style="background: white; padding: 25px; border-radius: 12px; width: 320px; text-align: left; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;"></div>
            </div>

            <div id="contactImageViewer" class="contact-image-viewer">
                <div class="contact-image-viewer-box">
                    <img id="contactImageViewerImg" src="" alt="Contact Image">
                    <button id="closeContactImageViewer" class="contact-image-viewer-close">Close Image</button>
                </div>
            </div>

            <div id="commModal" class="comm-modal">
                <div class="comm-box">
                    <h4 style="margin-top:0;">Contact Option</h4>
                    <a id="callLink" href="#" class="comm-btn" style="background: #007bff;">Voice Call</a>
                    <a id="smsLink" href="#" class="comm-btn" style="background: #17a2b8;">Send Text (SMS)</a>
                    <button id="closeComm" class="comm-btn" style="background: #666;">Cancel</button>
                </div>
            </div>

            <div id="warningModal" class="warning-modal">
                <div class="warning-box">
                    <h4 style="color: #dc3545;">Alert</h4>
                    <p>Name and Phone are required.</p>
                    <button id="closeWarning" style="padding: 10px 20px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 5px;">OK</button>
                </div>
            </div>

            <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 10px; text-align: center;">
                File: v3_FacilityContacts.js | Updated: 2026-05-28 02:23:00 PM
            </div>
        </div>
    `;

    function cleanFileName(fileName) {
        const name = fileName || 'contact-image.jpg';
        return name.replace(/[^a-zA-Z0-9._-]/g, '_');
    }

    async function saveContactImage(contactId, selectedFile) {
        if (!contactId || !selectedFile || !facility?.id) return;

        const filePath = `facility_${facility.id}/contact_${contactId}/${Date.now()}_${cleanFileName(selectedFile.name)}`;

        const { error: uploadError } = await supabase
            .storage
            .from(IMAGE_BUCKET)
            .upload(filePath, selectedFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload contact image error:', uploadError);
            return;
        }

        const { data: publicUrlData } = supabase
            .storage
            .from(IMAGE_BUCKET)
            .getPublicUrl(filePath);

        const imageUrl = publicUrlData?.publicUrl || '';

        const payload = {
            facility_id: facility.id,
            related_type: 'contact',
            related_id: contactId,
            image_url: imageUrl,
            image_path: filePath,
            image_name: selectedFile.name || 'Contact Image',
            image_notes: '',
            uploaded_by: ''
        };

        const { error } = await supabase
            .from('FACILITY_IMAGES')
            .insert([payload]);

        if (error) {
            console.error('Save contact image error:', error);
        }
    }

    async function getContactHeaderImage(contactId) {
        if (!contactId || !facility?.id) return '';

        const { data, error } = await supabase
            .from('FACILITY_IMAGES')
            .select('image_url')
            .eq('facility_id', facility.id)
            .eq('related_type', 'contact')
            .eq('related_id', contactId)
            .order('created_at', { ascending: true })
            .limit(1);

        if (error) {
            console.error('Load contact image error:', error);
            return '';
        }

        return data && data[0] && data[0].image_url ? data[0].image_url : '';
    }

    const loadContacts = async () => {
        const { data, error } = await supabase.from('CONTACTS').select('*').eq('facility_id', facility.id);
        if (error) { console.error("Load Error:", error); return; }
        
        const roleOptions = document.getElementById('roleOptions');
        const uniqueRoles = [...new Set(data.map(c => c.Role).filter(r => r))];
        if (roleOptions) {
            roleOptions.innerHTML = uniqueRoles.map(role => `<option value="${role}">`).join('');
        }

        const container = document.getElementById('contactList');
        if (data && data.length > 0) {
            container.innerHTML = data.map(c => `
                <button class="contactBtn" data-id="${c.id}" style="background: #f5c400; padding: 15px; border: none; border-radius: 8px; font-weight: bold; min-width: 120px; cursor: pointer;">
                    ${c.Name}<br><span style="font-size: 0.8em; font-weight: normal;">${c.Role || 'Staff'}</span>
                </button>
            `).join('');
            
            document.querySelectorAll('.contactBtn').forEach(btn => {
                btn.onclick = () => showDetails(data.find(c => c.id == btn.dataset.id));
            });
        } else {
            container.innerHTML = '<div style="padding: 20px; color: #666;">No contacts found.</div>';
        }
    };

    const showDetails = async (c) => {
        const detailModal = document.getElementById('detailModal');
        const detailContent = document.getElementById('detailContent');
        const contactImageUrl = await getContactHeaderImage(c.id);
        
        detailContent.innerHTML = `
            <div class="contact-detail-header">
                <div class="contact-detail-image">
                    ${contactImageUrl ? `<img src="${contactImageUrl}" class="open-contact-image" data-image-url="${contactImageUrl}" alt="Contact Image">` : `<span style="font-size:10px; color:#94a3b8;">IMAGE</span>`}
                </div>
                <h2 style="margin:0; color:#00264d;">${c.Name}</h2>
            </div>
            <div class="detail-row"><strong>Role:</strong> ${c.Role || 'N/A'}</div>
            <div class="detail-row"><strong>Phone:</strong> <a href="tel:${c.Phone}" class="detail-link">${c.Phone}</a></div>
            <div class="detail-row"><strong>Email:</strong> ${c.Email ? `<a href="mailto:${c.Email}" class="detail-link">${c.Email}</a>` : 'N/A'}</div>
            <div class="detail-row"><strong>Notes:</strong><br>${c.Notes || 'None'}</div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="commBtn" style="flex:1; padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">CONTACT</button>
                <button id="editBtn" style="flex:1; padding: 12px; background: #f5c400; color: #00264d; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">EDIT</button>
            </div>
            <button id="closeDetail" style="width:100%; margin-top: 10px; padding: 12px; background: #eee; border: none; border-radius: 6px; cursor: pointer;">CLOSE</button>
        `;

        detailModal.style.display = 'flex';

        document.getElementById('closeDetail').onclick = () => detailModal.style.display = 'none';

        const openContactImage = detailContent.querySelector('.open-contact-image');
        if (openContactImage) {
            openContactImage.onclick = () => {
                document.getElementById('contactImageViewerImg').src = openContactImage.dataset.imageUrl;
                document.getElementById('contactImageViewer').style.display = 'flex';
            };
        }
        
        document.getElementById('editBtn').onclick = () => {
            detailModal.style.display = 'none';
            openEditModal(c);
        };

        document.getElementById('commBtn').onclick = () => {
            document.getElementById('callLink').href = `tel:${c.Phone}`;
            document.getElementById('smsLink').href = `sms:${c.Phone}`;
            document.getElementById('commModal').style.display = 'flex';
        };
    };

    const openEditModal = (c) => {
        document.getElementById('cId').value = c.id;
        document.getElementById('cName').value = c.Name;
        document.getElementById('cRole').value = c.Role || '';
        document.getElementById('cPhone').value = c.Phone;
        document.getElementById('cEmail').value = c.Email || '';
        document.getElementById('cNotes').value = c.Notes || '';
        document.getElementById('modalTitle').innerText = "Edit Contact";
        pendingContactImageFile = null;
        document.getElementById('pendingContactImageStatus').style.display = 'none';
        document.getElementById('pendingContactImageFile').value = '';
        document.getElementById('contactModal').style.display = 'flex';
    };

    document.getElementById('addContactBtn').onclick = () => {
        document.getElementById('cId').value = '';
        document.getElementById('cName').value = '';
        document.getElementById('cRole').value = '';
        document.getElementById('cPhone').value = '';
        document.getElementById('cEmail').value = '';
        document.getElementById('cNotes').value = '';
        document.getElementById('modalTitle').innerText = "New Contact";
        document.getElementById('pendingContactImageStatus').style.display = 'none';
        document.getElementById('pendingContactImageFile').value = '';
        pendingContactImageFile = null;
        document.getElementById('contactModal').style.display = 'flex';
    };

    document.getElementById('pendingContactImageBtn').onclick = () => {
        document.getElementById('pendingContactImageFile').value = '';
        document.getElementById('pendingContactImageFile').click();
    };

    document.getElementById('pendingContactImageFile').onchange = () => {
        const fileInput = document.getElementById('pendingContactImageFile');
        const selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
        const status = document.getElementById('pendingContactImageStatus');

        if (!selectedFile) return;

        pendingContactImageFile = selectedFile;
        status.innerText = 'Image ready. Save contact to attach it.';
        status.style.display = 'block';
    };

    document.getElementById('saveContact').onclick = async () => {
        const id = document.getElementById('cId').value;
        const name = document.getElementById('cName').value.trim();
        const phone = document.getElementById('cPhone').value.trim();

        if (!name || !phone) {
            document.getElementById('warningModal').style.display = 'flex';
            return;
        }

        const payload = {
            Name: name,
            Role: document.getElementById('cRole').value.trim(),
            Phone: phone,
            Email: document.getElementById('cEmail').value.trim(),
            Notes: document.getElementById('cNotes').value.trim(),
            facility_id: facility.id
        };

        let result;
        if (id) {
            result = await supabase.from('CONTACTS').update(payload).eq('id', id).select();
        } else {
            result = await supabase.from('CONTACTS').insert([payload]).select();
        }

        if (result.error) {
            alert("Error saving contact");
        } else {
            const savedContact = result.data[0];

            if (savedContact && pendingContactImageFile) {
                document.getElementById('pendingContactImageStatus').innerText = 'Saving image...';
                document.getElementById('pendingContactImageStatus').style.display = 'block';
                await saveContactImage(savedContact.id, pendingContactImageFile);
                pendingContactImageFile = null;
            }

            document.getElementById('contactModal').style.display = 'none';
            loadContacts();
        }
    };

    document.getElementById('closeModal').onclick = () => {
        document.getElementById('contactModal').style.display = 'none';
        pendingContactImageFile = null;
        loadContacts();
    };

    document.getElementById('closeContactImageViewer').onclick = () => {
        document.getElementById('contactImageViewer').style.display = 'none';
        document.getElementById('contactImageViewerImg').src = '';
    };

    document.getElementById('contactImageViewer').onclick = (event) => {
        if (event.target.id === 'contactImageViewer') {
            document.getElementById('contactImageViewer').style.display = 'none';
            document.getElementById('contactImageViewerImg').src = '';
        }
    };

    document.getElementById('closeComm').onclick = () => document.getElementById('commModal').style.display = 'none';
    document.getElementById('closeWarning').onclick = () => document.getElementById('warningModal').style.display = 'none';
    document.getElementById('backToHub').onclick = () => window.navigateTo('facilityControls', facility);

    loadContacts();
}
