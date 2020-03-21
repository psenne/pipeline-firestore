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
    return function(item) {
        return !searchTerm || item.info.contract === searchTerm;
    };
}

export default function PositionsTable({ positions }) {
    const { selectedcontract, searchterm } = useContext(PositionContext);
    return (
        <Grid columns={16} verticalAlign="middle" divided="vertically" className="hovered">
            {positions
                .filter(isFiltered(selectedcontract))
                .filter(isSearched(searchterm))
                .map(item => {
                    const position_id = item.info.position_id ? `(${item.info.position_id})` : "";
                    const contract = item.info.contract ? `${item.info.contract} - ` : "";
                    const level = item.info.level ? item.info.level : "";
                    const dash = item.info.level && item.info.skill_summary ? "-" : "";
                    const location = item.info.location ? `Location: ${item.info.location}` : "";

                    return (
                        <Grid.Row columns={2} key={item.key} centered className={classnames({ "candidate-submitted": item.candidates_submitted }, "candidate-table-row")}>
                            <Grid.Column width={15}>
                                <Link to={`/positions/${item.key}`}>
                                    <Header>
                                        <Header.Content>
                                            {contract} {item.info.title} {position_id}
                                        </Header.Content>
                                        <Header.Subheader>
                                            <div>
                                                {level} {dash} {item.info.skill_summary}
                                            </div>
                                            <div>{location}</div>
                                        </Header.Subheader>
                                    </Header>
                                    <div>{item.info.description}</div>
                                </Link>
                                {item.info.candidates_submitted && (
                                    <Header sub>
                                        Candidates submitted:
                                        {Object.keys(item.info.candidates_submitted).map(ckey => {
                                            const candidate = item.info.candidates_submitted[ckey];
                                            return (
                                                <Link key={ckey} to={`/candidates/${ckey}`}>
                                                    <Label color="blue" key={ckey} content={candidate.candidate_name} icon="user secret" />
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
