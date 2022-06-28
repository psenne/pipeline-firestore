export const tmplSubmission = {
    candidate_key: null,
    position_key: null,
    contract_key: null,
    contract: "",
    candidate_name: "",
    position_id: "",
    position_title: "",
    position_level: "",
    submission_date: ""
};

export const tmplCandidate = {
    current_contract: "",
    current_company: "",
    firstname: "",
    lastname: "",
    emailaddress: "",
    telephone: "",
    title: "",
    found_by: "",
    filenames: [],
    interview_date: null,
    interviewed_by: [],
    level: "",
    loi_status: "notsent",
    loi_sent_date: null,
    loi_sent_by: "",
    location: "",
    next_steps: "",
    notes: "",
    potential_contracts: [],
    prefered_location: "",
    skill: "",
    salary: "",
    status: "initial",
    archived: "current",
    isFlagged: false,
    flagged_by: "",
    flag_note: "",
    flagged_on: null,
    actioned_to: "",
    flag_history: [],
    created_date: null,
    created_by: "",
    modified_date: null,
    modified_by: "",
    modified_fields: [],
    resume_text: ""
};

export const tmplPosition = {
    archived: false,
    title: "",
    description: "",
    level: "",
    skill_summary: "",
    position_id: "",
    contract: "",
    location: "",
    added_on: "",
    added_by: "",
    modified_by: "",
    modified_on: ""
};

// prettier-ignore
export const tmplLOIStatus = [
    { key: "notsent", text: "Not Sent", value: "notsent" },
    { key: "sent", text: "Sent", value: "sent" },
    { key: "accepted", text: "Accepted", value: "accepted" }
];
