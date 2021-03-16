import React, { Component } from "react";
import { fbStatusesDB } from "../firebase.config";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import CandidateSummary from "./CandidateSummary";

//uses search field value to filter array of candidates for table population
function isSearched(s) {
    return function (item) {
        const contracts = item.info.potential_contracts ? item.info.potential_contracts.join(":").toLowerCase() : "";
        const searchTerm = s;
        let wasFound = true;

        s.split(" ").forEach(searchTerm => {
            let termFound = false;
            if (item.info.firstname.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.lastname.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.found_by.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.prefered_location.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.skill.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.current_company.toLowerCase().includes(searchTerm.toLowerCase()) || contracts.includes(searchTerm.toLowerCase()) || item.info.notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.next_steps.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.resume_text.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.level.toLowerCase().includes(searchTerm.toLowerCase())) {
                termFound = true;
            }
            wasFound = wasFound && termFound;
        });

        return !searchTerm || wasFound;
    };
}

// filters candidates by status
function isFiltered(searchTerm) {
    return function (item) {
        return !searchTerm || item.info.status.toLowerCase() === searchTerm.toLowerCase();
    };
}

class CandidatesTable extends Component {
    static contextType = CandidateSearchContext;

    constructor(props) {
        super(props);

        this.state = {
            statuses: []
        };
    }

    componentDidMount() {
        this.listener = fbStatusesDB.on("value", data => {
            let statuses = [];
            data.forEach(function (status) {
                statuses.push({ ...status.val() });
            });
            this.setState({
                statuses
            });
        });
    }

    componentWillUnmount() {
        fbStatusesDB.off("value", this.listener);
    }

    render() {
        const { searchterm, status } = this.context;
        const filteredCandidates = this.props.list.filter(isFiltered(status)).filter(isSearched(searchterm));
        const { statuses } = this.state;

        return (
            <>
                {filteredCandidates.map(candidate => (
                    <CandidateSummary key={candidate.key} candidate={candidate} statuses={statuses} />
                ))}
            </>
        );
    }
}

export default CandidatesTable;
