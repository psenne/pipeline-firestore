import React, { Component } from "react";
import UserContext from "../contexts/UserContext";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import { Link } from "react-router-dom";
import { Grid, Header } from "semantic-ui-react";
import classnames from "classnames";
import MiniToolbar from "./MiniToolbar";

//uses search field value to filter array of candidates for table population
function isSearched(s) {
    return function(item) {
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
    return function(item) {
        return !searchTerm || item.info.status.toLowerCase() === searchTerm.toLowerCase();
    };
}

class CandidatesTable extends Component {
    static contextType = CandidateSearchContext;
    render() {
        const { archived, searchterm, status } = this.context;
        const filteredCandidates = this.props.list
            .filter(isFiltered(status))
            .filter(isSearched(searchterm))
            .filter(item => {
                return item.info.archived === archived;
            });

        return (
            <Grid columns={16} verticalAlign="middle" divided="vertically" className="hovered">
                {filteredCandidates.map(item => {
                    const potential_contracts = item.info.potential_contracts ? item.info.potential_contracts.join(", ") : "";
                    const company = item.info.company ? `with ${item.info.company}` : "";
                    const current_contract = item.info.current_contract ? `on ${item.info.current_contract}` : "";

                    return (
                        <Grid.Row key={item.key} columns={2} className={classnames("status-" + item.info.status, "candidate-table-row")}>
                            <Grid.Column textAlign="center" width={1}>
                                <MiniToolbar ckey={item.key} candidate={item.info} />
                            </Grid.Column>
                            <Grid.Column width={15}>
                                <Link to={`/candidates/${item.key}`}>
                                    <>
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
                                    </>
                                </Link>
                            </Grid.Column>
                        </Grid.Row>
                    );
                })}
            </Grid>
        );
    }
}

export default CandidatesTable;
