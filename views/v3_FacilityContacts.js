/* =================================================
FILE: views/v3_FacilityContacts.js
PURPOSE: Render Facility Contacts and Contact Detail View
UPDATED: 2026-05-29 06:10:00 PM
================================================= */

// ... (Keep all existing code, update only the button logic inside openContactDetail)

    document.getElementById('addContactIssueBtn').onclick = () => {
        const issueData = {
            facility: facility,
            autoOpenModal: true, // New flag to trigger the popup
            prefill: {
                initiated_by: contact.Name,
                contact_id: contact.id
            }
        };
        
        // Update hash and dispatch event
        window.location.hash = `#facilityIssues?facilityId=${facility.id}&initiatedBy=${encodeURIComponent(contact.Name)}`;
        window.dispatchEvent(new CustomEvent('navigate', { 
            detail: { target: 'facilityIssues', data: issueData } 
        }));
    };
