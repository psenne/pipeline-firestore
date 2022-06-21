import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fbComments } from "../firebase.config";
import { List, Image, Comment } from "semantic-ui-react";
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

    if (pageloading) {
        return <ComponentPlaceholder lines="6" />;
    }

    if (!filteredComments.length) {
        return false;
    }

    return (
        <>
            <h3>Recent Comments</h3>
            <Comment.Group style={{ maxWidth: "none" }}>
                {filteredComments.map(comment => {
                    const commentdate = comment.comment_date.toDate();
                    const comment_date = comment.comment_date ? formatDistance(commentdate, new Date(), { addSuffix: true }) : "";
                    return (
                        <Comment key={comment.id}>
                            <Comment.Avatar src={comment.avatar || ""} />
                            <Comment.Content>
                                <Comment.Author as="span">
                                    {comment.author} commented on <Link to={`/${comment.refurl}`}>{comment.refname}</Link>
                                </Comment.Author>
                                <Comment.Metadata>
                                    <div>{comment_date}</div>
                                </Comment.Metadata>
                                <Comment.Text>
                                    <Markdown>{comment.text || ""}</Markdown>
                                </Comment.Text>
                            </Comment.Content>
                        </Comment>
                    );
                })}
            </Comment.Group>
        </>
    );
};

export default RecentComments;
