import React, { useState, useEffect } from "react";
import { fbComments } from "../firebase.config";
import { Comment as SUIComment, Header, Icon } from "semantic-ui-react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

// const comments = [
//     { id: 2345, refid: "asdfjorjiijodi", author: "Mike P.", avatar: "https://picsum.photos/64", text: "This site is amazing.", comment_date: new Date("12/10/2020") },
//     { id: 45645, refid: "asdfwefwef", author: "Dan S.", avatar: "https://picsum.photos/64", text: "I agree. You are the best dev.", comment_date: new Date("5/10/2021") }
// ];

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
        <SUIComment.Group>
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
