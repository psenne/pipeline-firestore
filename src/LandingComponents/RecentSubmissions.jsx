import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fbPositionsDB } from "../firebase.config";
import { Container, List } from "semantic-ui-react";
import ComponentPlaceholder from "./ComponentPlaceholder";
import { format, parseISO } from "date-fns";

const RecentSubmissions = () => {
    const [candidateSubmissions, setCandidateSubmissions] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        setpageloading(true);
        let getSubmissions = null;
        const getPositions = fbPositionsDB.on("value", data => {
            let tmpitems = [];
            data.forEach(function(positiondata) {
                const positioninfo = positiondata.val();
                const submissions = positioninfo.candidates_submitted;
                if (submissions) {
                    Object.keys(submissions).forEach(candidatekey => {
                        const tmpobject = { candidatekey, submissioninfo: submissions[candidatekey], positionkey: positiondata.key, positioninfo };
                        tmpitems.push(tmpobject);
                    });
                }
            });
            setCandidateSubmissions(tmpitems);
            setpageloading(false);
        });
        return () => {
            fbPositionsDB.off("value", getPositions);
            fbPositionsDB.off("value", getSubmissions);
        };
    }, []);

    return (
        <Container>
            <h3>Submitted candidates</h3>
            {pageloading ? (
                <ComponentPlaceholder lines="6" />
            ) : (
                <List selection verticalAlign="middle" divided relaxed>
                    {candidateSubmissions.map(({ positioninfo, submissioninfo, positionkey, candidatekey }) => {
                        return (
                            <List.Item key={positionkey + candidatekey}>
                                <List.Content>
                                    <List.Header>
                                        <Link to={`/candidates/${candidatekey}`}>{submissioninfo.candidate_name}</Link> submitted for <Link to={`/positions/${positionkey}`}>{positioninfo.title}</Link> on {positioninfo.contract} ({format(parseISO(submissioninfo.submission_date), "MMM d, yyyy")})
                                    </List.Header>
                                </List.Content>
                            </List.Item>
                        );
                    })}
                </List>
            )}
        </Container>
    );
};

export default RecentSubmissions;
