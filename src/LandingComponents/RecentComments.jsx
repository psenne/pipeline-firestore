import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fbComments } from "../firebase.config";
import { List, Image } from "semantic-ui-react";
import ComponentPlaceholder from "./ComponentPlaceholder";
import { formatDistance, differenceInDays } from "date-fns";
import Markdown from "markdown-to-jsx";

const RecentComments = () => {
    const [comments, setcomments] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        setpageloading(true);
        const unsub = fbComments
            .orderBy("comment_date", "desc")
            .limit(50)
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

    useEffect(() => {
        const f = comments.filter(comment => {
            const commentdate = comment.comment_date.toDate();
            const today = new Date();
            const isRecentComment = differenceInDays(today, commentdate) < 14;
            return isRecentComment;
        });
        setFilteredComments(f);
    }, [comments]);

    return (
        <>
            <h3>Recent Comments</h3>
            {pageloading ? (
                <ComponentPlaceholder lines="6" />
            ) : filteredComments.length > 0 ? (
                <>
                    <List selection divided relaxed>
                        {filteredComments.map(comment => {
                            const commentdate = comment.comment_date.toDate();
                            const comment_date = comment.comment_date ? formatDistance(commentdate, new Date(), { addSuffix: true }) : "";
                            return (
                                <List.Item key={comment.id}>
                                    <Image avatar src={comment.avatar} />
                                    <List.Content>
                                        <List.Header>
                                            {comment.author} commented on <Link to={`/${comment.refurl}`}>{comment.refname}</Link>
                                        </List.Header>
                                        <List.Description>
                                            <Markdown>{comment.text || ""}</Markdown>
                                        </List.Description>
                                        {comment_date}
                                    </List.Content>
                                </List.Item>
                            );
                        })}
                    </List>
                </>
            ) : (
                "No comments made in past two weeks."
            )}
        </>
    );
};

export default RecentComments;
