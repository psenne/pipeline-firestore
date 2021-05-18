import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fbComments } from "../firebase.config";
import { Container, List, Image } from "semantic-ui-react";
import ComponentPlaceholder from "./ComponentPlaceholder";
import { formatDistance } from "date-fns";
import Markdown from "markdown-to-jsx";

const RecentComments = () => {
    const [comments, setcomments] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        setpageloading(true);
        const unsub = fbComments
            .orderBy("comment_date", "desc")
            .limit(5)
            .onSnapshot(docs => {
                let tmp = [];
                docs.forEach(doc => {
                    tmp.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                setcomments(tmp);
                setpageloading(false);
            });
        return () => {
            unsub();
        };
    }, []);

    return (
        <Container>
            <h3>Recent Comments</h3>
            {pageloading ? (
                <ComponentPlaceholder lines="6" />
            ) : (
                <List selection divided relaxed>
                    {comments.map(comment => {
                        const comment_date = comment.comment_date ? formatDistance(comment.comment_date.toDate(), new Date(), { addSuffix: true }) : "";

                        return (
                            <List.Item key={comment.id}>
                                <Image avatar src={comment.avatar} />
                                <List.Content>
                                    <List.Header>
                                        {comment.author} commented on <Link to={`/${comment.refurl}`}>{comment.refname}</Link>
                                    </List.Header>
                                    <List.Description>
                                        <Markdown>{comment.text}</Markdown>
                                    </List.Description>
                                    {comment_date}
                                </List.Content>
                            </List.Item>
                        );
                    })}
                </List>
            )}
        </Container>
    );
};

export default RecentComments;
