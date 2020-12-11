const tmplCandidate = {
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
    submitted_positions: {},
    resume_text: ""
};

// prettier-ignore
const tmplLOIStatus = [
    { key: "notsent", text: "Not Sent", value: "notsent" },
    { key: "sent", text: "Sent", value: "sent" },
    { key: "accepted", text: "Accepted", value: "accepted" }
];

export { tmplCandidate, tmplLOIStatus };
