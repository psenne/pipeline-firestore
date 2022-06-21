import React, { useState, useEffect } from "react";
import { fbComments } from "../firebase.config";
import { Comment as SUIComment, Header, Icon } from "semantic-ui-react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

export default function CommentSection({ refinfo }) {
    const [comments, setcomments] = useState([]);
    const { refid } = refinfo;

    useEffect(() => {
        const unsub = fbComments
            .where("refid", "==", refid)
            .orderBy("comment_date", "desc")
            .onSnapshot(docs => {
                let tmp = [];
                docs.forEach(doc => {
                    tmp.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                setcomments(tmp);
            });
        return () => {
            unsub();
        };
    }, [refid]);

    return (
        <SUIComment.Group style={{ maxWidth: "none" }}>
            <Header>
                <Icon name="comments" />
                Comments
            </Header>
            {comments.map(comment => (
                <Comment key={comment.id} comment={comment} />
            ))}
            <CommentForm refinfo={refinfo} />
        </SUIComment.Group>
    );
}
