/* =================================================
FILE: reports_v8_data.js
PURPOSE: Handle Supabase CRUD for Facility Reports
UPDATED: 2026-05-29 10:15:00 PM

STRICT HEADER RULE:
Do not ever remove or change this header section.
================================================= */
import { supabase } from '../js/supabaseClient.js';

export async function fetchReportIssues(facilityId) {
    return await supabase
        .from('FACILITY_PROJECT_ISSUES')
        .select('*')
        .eq('project_id', facilityId)
        .order('created_at', { ascending: false });
}

export async function fetchFollowupsForIssue(issueId) {
    return await supabase
        .from('ISSUE_FOLLOWUPS')
        .select('*')
        .eq('issue_id', issueId)
        .order('timestamp', { ascending: true });
}

export async function fetchImagesForIssue(issueId) {
    return await supabase
        .from('FACILITY_PROJECT_ISSUE_IMAGES')
        .select('*')
        .eq('issue_id', issueId);
}
