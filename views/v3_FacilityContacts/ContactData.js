
/* =================================================
FILE: views/v3_FacilityContacts/v3_ContactData.js
PURPOSE: Supabase Data Fetches & Inserts for Contacts
UPDATED: 2026-05-29 06:45:00 PM
================================================= */

import { supabase } from '../../js/supabaseClient.js';

/**
 * Fetches all raw data needed for the Contacts Grid
 */
export async function getContactsGridData(facilityId) {
    // 1. Fetch Contacts
    const { data: contacts } = await supabase
        .from('CONTACTS')
        .select('*')
        .eq('facility_id', facilityId);

    // 2. Fetch Open Issues to calculate red badges
    const { data: openIssues } = await supabase
        .from('FACILITY_ISSUES')
        .select('id, initiated_by')
        .eq('open_issue', true)
        .eq('facility_id', facilityId);

    // 3. Fetch all contact images
    const { data: allImages } = await supabase
        .from('FACILITY_IMAGES')
        .select('*')
        .eq('related_type', 'contact');

    return { contacts, openIssues, allImages };
}

/**
 * Saves a new contact to the database
 */
export async function saveNewContact(contactData) {
    const { data, error } = await supabase
        .from('CONTACTS')
        .insert([contactData]);
    
    if (error) throw error;
    return data;
}

/**
 * Fetches the latest image for a specific contact
 */
export async function getContactImages(contactId) {
    const { data: images } = await supabase
        .from('FACILITY_IMAGES')
        .select('*')
        .eq('related_type', 'contact')
        .eq('related_id', contactId);
        
    return images || [];
}
