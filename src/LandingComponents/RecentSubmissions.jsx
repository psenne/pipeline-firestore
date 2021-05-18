import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import firebase from "../firebase.config";
import { Container, List } from "semantic-ui-react";
import ComponentPlaceholder from "./ComponentPlaceholder";
import { format } from "date-fns";

const RecentSubmissions = () => {
    const [candidateSubmissions, setCandidateSubmissions] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        setpageloading(true);
        const getSubmissions = firebase
            .firestore()
            .collectionGroup("submitted_candidates")
            .orderBy("submission_date", "desc")
            .limit(5)
            .onSnapshot(submissions => {
                let tmpitems = [];
                submissions.forEach(submission => {
                    tmpitems.push(submission.data());
                });
                setCandidateSubmissions(tmpitems);
                setpageloading(false);
            });
        return () => {
            getSubmissions();
        };
    }, []);

    return (
        <Container>
            <h3>Submitted candidates</h3>
            {pageloading ? (
                <ComponentPlaceholder lines="6" />
            ) : (
                <List selection verticalAlign="middle" divided relaxed>
                    {candidateSubmissions.map(submission => {
                        return (
                            <List.Item key={submission.position_key + submission.candidate_id}>
                                <List.Content>
                                    <List.Header>
                                        <Link to={`/candidates/${submission.candidate_id}`}>{submission.candidate_name}</Link> submitted for <Link to={`/positions/${submission.position_key}`}>{submission.position_title}</Link> on {submission.position_contract}
                                    </List.Header>
                                    {format(submission.submission_date.toDate(), "MMM d, yyyy")}
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
