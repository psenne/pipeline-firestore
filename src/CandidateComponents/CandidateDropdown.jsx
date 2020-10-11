import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";
import { fbCandidatesDB } from "../firebase.config";

// returns an array of contract names:
// [hawkeye, meritage, R2]

export default class CandidateDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = { candidates: [] };
        this.orderedCandidates = fbCandidatesDB.orderBy("firstname");
    }

    componentDidMount() {
        const { filters } = this.props;

        //filters = [{ filter1: value1, filter2: [value1, value2] }]; -- filters format

        this.unsubCandidate = this.orderedCandidates.onSnapshot(doc => {
            const filteredData = [];
            doc.forEach(function(candidate) {
                const info = candidate.data();
                const key = candidate.id;
                let meetsAllCriteria = true;

                filters.forEach(filter => {
                    const field = Object.keys(filter)[0]; //get fieldname from props filter (string)
                    const values = Object.values(filter)[0]; //get corresponding value from props filter (arrray)
                    let meetsInnerCriteria = false;

                    values.forEach(value => {
                        meetsInnerCriteria = meetsInnerCriteria || info[field] === value;
                    });
                    meetsAllCriteria = meetsAllCriteria && meetsInnerCriteria;
                });

                if (meetsAllCriteria) filteredData.push({ key, info });
            });

            this.setState({
                candidates: filteredData
            });
        });
    }

    componentWillUnmount() {
        this.unsubCandidate();
    }

    onChange = (ev, selection) => {
        const { candidates } = this.state;
        if (selection.value) this.props.onChange(candidates.filter(c => c.key === selection.value)[0]);
    };

    render() {
        const { removecandidates, text, value, multiple = false, clearable = false, selection = false, required = false } = this.props;
        const { candidates } = this.state;
        const candidateList = candidates.filter(ReturnRemainingCandidates(removecandidates)).map(({ key, info: candidate }) => {
            const candidatename = candidate.firstname + " " + candidate.lastname;
            return { key: key, text: candidatename, value: key };
        });
        return <Dropdown text={text} selectOnBlur={false} placeholder="Select Candidate" value={value} required={required} clearable={clearable} multiple={multiple} selection={selection} options={candidateList} onChange={this.onChange} />;
    }
}

function ReturnRemainingCandidates(removecandidates) {
    return function(candidate) {
        return !removecandidates.map(rc => rc.key).includes(candidate.key);
    };
}
