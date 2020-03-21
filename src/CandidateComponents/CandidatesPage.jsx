import React, { Component } from "react";
import { fbCandidatesDB } from "../firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import { Loader, Dimmer } from "semantic-ui-react";
import NavBar from "../NavBar";
import CandidateToolbar from "./CandidateToolbar";
import CandidatesTable from "./CandidatesTable";

class CandidatesPage extends Component {
    constructor(props) {
        super(props);

        // this.orderedCandidates = fbCandidatesDB.orderByChild("firstname"); //used for sorting and populating candidate table.
        this.orderedCandidates = fbCandidatesDB.orderBy('firstname').where("archived","==","current");
        this.state = {
            candidateList: [],
            pageLoading: false
        };
    }

    componentDidMount() {
        this.setState({ pageLoading: true });
        this.unsubscribe = this.orderedCandidates.onSnapshot(doc => {
            let tmpitems = [];
            doc.forEach(function(candidate) {
                tmpitems.push({ key: candidate.id, info: Object.assign({}, tmplCandidate, candidate.data()) });
            });

            this.setState({ candidateList: tmpitems }, () => {
                this.setState({ pageLoading: false });
            });
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const { candidateList, pageLoading } = this.state;
        const flaggedCandidates = candidateList.filter(candidate => {
            return candidate.info.isFlagged;
        });
        const unflaggedCandidates = candidateList.filter(candidate => {
            return !candidate.info.isFlagged;
        });

        return (
            <>
                <Dimmer active={pageLoading}>
                    <Loader>Loading candidates...</Loader>
                </Dimmer>
                <NavBar active="candidates" />
                <CandidateToolbar candidates={this.state.candidateList} />
                <CandidatesTable list={flaggedCandidates} />
                <CandidatesTable list={unflaggedCandidates} />
            </>
        );
    }
}

export default CandidatesPage;
