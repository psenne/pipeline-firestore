import React, { Component } from "react";
import firebase from "../firebase.config";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import { Link } from "react-router-dom";
import { Grid, Container, Header, Segment, Label } from "semantic-ui-react";
import { format, parseISO } from "date-fns";
import classnames from "classnames";
import MiniToolbar from "./MiniToolbar";

//uses search field value to filter array of candidates for table population
function isSearched(s) {
    return function (item) {
        const contracts = item.info.potential_contracts ? item.info.potential_contracts.join(":").toLowerCase() : "";
        const searchTerm = s;
        let wasFound = true;

        s.split(" ").forEach(searchTerm => {
            let termFound = false;
            if (item.info.firstname.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.lastname.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.found_by.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.prefered_location.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.skill.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.current_company.toLowerCase().includes(searchTerm.toLowerCase()) || contracts.includes(searchTerm.toLowerCase()) || item.info.notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.next_steps.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.level.toLowerCase().includes(searchTerm.toLowerCase())) {
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
    render() {
        const { searchterm, status } = this.context;
        const filteredCandidates = this.props.list.filter(isFiltered(status)).filter(isSearched(searchterm));

        return (
            <Container fluid className="hovered">
                {filteredCandidates.map(item => {
                    const potential_contracts = item.info.potential_contracts ? item.info.potential_contracts.join(", ") : "";
                    const company = item.info.company ? `with ${item.info.company}` : "";
                    const current_contract = item.info.current_contract ? `on ${item.info.current_contract}` : "";
                    const created = item.info.created_by ? `Created on ${format(item.info.created_date.toDate(), "MMM d, yyyy")} by ${item.info.created_by}` : "";
                    const updated = item.info.modified_by ? `Updated on ${format(item.info.modified_date.toDate(), "MMM d, yyyy")} by ${item.info.modified_by}` : "";

                    return (
                        <div key={item.key} className={classnames("status-" + item.info.status, "candidate-table-row")}>
                            <MiniToolbar attached="top" ckey={item.key} candidate={item.info} />
                            <Segment key={item.key} attached padded>
                                <Link to={`/candidates/${item.key}`}>
                                    <Header>
                                        <Header.Content>
                                            {item.info.firstname} {item.info.lastname}
                                        </Header.Content>

                                        <Header.Subheader>
                                            {item.info.level} {item.info.skill} {company} {current_contract}
                                        </Header.Subheader>
                                    </Header>
                                    <div>
                                        <span className="candidate-table-field">Potential contracts:</span> {potential_contracts}
                                    </div>
                                    <div>
                                        <span className="candidate-table-field">Notes:</span> {item.info.notes}
                                    </div>
                                    <div>
                                        <span className="candidate-table-field">Next steps:</span> {item.info.next_steps}
                                    </div>
                                </Link>
                            </Segment>
                            <Header color="grey" textAlign="centered" icon="write" attached="bottom">{created} | {updated}</Header>
                        </div>
                    );
                })}
            </Container>
        );
    }
}

export default CandidatesTable;
