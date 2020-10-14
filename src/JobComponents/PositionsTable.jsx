import React, { useContext } from "react";
import { Link } from "react-router-dom";
import PositionContext from "../contexts/PositionContext";
import { Grid, Header, Label } from "semantic-ui-react";
import classnames from "classnames";

//uses search field value to filter array of candidates for table population
function isSearched(s) {
    return function(item) {
        const searchTerm = s;
        let wasFound = true;

        s.split(" ").forEach(searchTerm => {
            let termFound = false;
            if (item.info.location.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.description.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.skill_summary.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.level.toLowerCase().includes(searchTerm.toLowerCase())) {
                termFound = true;
            }
            wasFound = wasFound && termFound;
        });

        return !searchTerm || wasFound;
    };
}

// filters candidates by status
function isFiltered(searchTerm) {
    return function(position) {
        return !searchTerm || position.info.contract === searchTerm;
    };
}

export default function PositionsTable({ positions }) {
    const { selectedcontract, searchterm } = useContext(PositionContext);
    return (
        <Grid columns={16} verticalAlign="middle" divided="vertically" className="hovered">
            {positions
                .filter(isFiltered(selectedcontract))
                .filter(isSearched(searchterm))
                .map(position => {
                    const position_id = position.info.position_id ? `(${position.info.position_id})` : "";
                    const contract = position.info.contract ? `${position.info.contract} - ` : "";
                    const level = position.info.level ? position.info.level : "";
                    const dash = position.info.level && position.info.skill_summary ? "-" : "";
                    const location = position.info.location ? `Location: ${position.info.location}` : "";

                    return (
                        <Grid.Row columns={2} key={position.key} centered className={classnames({ "candidate-submitted": position.submitted_candidates.length > 0 }, "candidate-table-row")}>
                            <Grid.Column width={15}>
                                <Link to={`/positions/${position.key}`}>
                                    <Header>
                                        <Header.Content>
                                            {contract} {position.info.title} {position_id}
                                        </Header.Content>
                                        <Header.Subheader>
                                            <div>
                                                {level} {dash} {position.info.skill_summary}
                                            </div>
                                            <div>{location}</div>
                                        </Header.Subheader>
                                    </Header>
                                    <div>{position.info.description}</div>
                                </Link>
                                {position.submitted_candidates.length > 0 && (
                                    <Header sub>
                                        Candidates submitted:
                                        {position.submitted_candidates.map(candidate => {
                                            return (
                                                <Link key={candidate.key} to={`/candidates/${candidate.key}`}>
                                                    <Label color="blue" key={candidate.key} content={candidate.info.candidate_name} icon="user secret" />
                                                </Link>
                                            );
                                        })}
                                    </Header>
                                )}
                            </Grid.Column>
                        </Grid.Row>
                    );
                })}
        </Grid>
    );
}
