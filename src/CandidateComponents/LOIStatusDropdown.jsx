import React from "react";
import { Select } from "semantic-ui-react";
import { tmplLOIStatus } from "../constants/candidateInfo";

// returns a string: "Not Sent"

const LOIStatusDropdown = ({ onChange, value }) => {
    return <Select name="loi_status" value={value} options={tmplLOIStatus} placeholder="LOI Status" onChange={(ev, selection) => onChange(selection.value)} />;
};

export default LOIStatusDropdown;
