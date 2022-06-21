import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fbSubmissionsDB } from "../firebase.config";
import { tmplSubmission } from "../constants";
import { Container, List, Header, Icon } from "semantic-ui-react";
import ComponentPlaceholder from "./ComponentPlaceholder";
import { format } from "date-fns";

const RecentSubmissions = () => {
    const [submissions, setsubmissions] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        setpageloading(true);
        const getSubmissions = fbSubmissionsDB
            .orderBy("submission_date", "desc")
            .limit(5)
            .onSnapshot(docs => {
                let tmpitems = [];
                docs.forEach(submission => {
                    const info = { ...tmplSubmission, ...submission.data() };
                    tmpitems.push({ id: submission.id, ...info });
                });
                setsubmissions(tmpitems);
                setpageloading(false);
            });
        return () => {
            getSubmissions();
        };
    }, []);

    return (
        <Container>
            <Header>
                <Icon name="smile" />
                Submitted candidates
            </Header>
            {pageloading ? (
                <ComponentPlaceholder lines="6" />
            ) : (
                <List selection verticalAlign="middle" relaxed>
                    {submissions.map(submission => {
                        return (
                            <List.Item key={submission.id}>
                                <List.Content>
                                    <List.Header>
                                        <Link to={`/candidates/${submission.candidate_key}`}>{submission.candidate_name}</Link> submitted for{" "}
                                        <Link to={`/positions/${submission.position_key}`}>
                                            {submission.position_level} {submission.position_title}
                                        </Link>{" "}
                                        on {submission.contract}
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
