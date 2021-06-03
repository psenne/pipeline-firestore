import React, { useState, useContext } from "react";
import firebase, { fbComments, fbCandidatesDB } from "../firebase.config";
import UserContext from "../contexts/UserContext";
import { Form, Input } from "semantic-ui-react";

export default function CommentForm({ refinfo }) {
    const [commenttext, setcommenttext] = useState("");
    const currentuser = useContext(UserContext);
    const { refid, refname, refpath } = refinfo;

    function AddComment() {
        const author = currentuser.displayName;
        const avatar = currentuser.photoURL;
        const comment_date = firebase.firestore.FieldValue.serverTimestamp();
        fbComments
            .add({
                text: commenttext,
                author,
                comment_date,
                refid,
                avatar,
                refurl: `${refpath}/${refid}`,
                refname
            })
            .then(() => {
                fbCandidatesDB.doc(refid).update({ modified_date: comment_date, modified_by: author, modified_fields: [] });
                setcommenttext("");
            });
    }

    return (
        <Form reply>
            <Input
                fluid
                placeholder="Add your comment"
                value={commenttext}
                action={{
                    icon: "add",
                    onClick: () => {
                        AddComment();
                    },
                    disabled: commenttext.length === 0
                }}
                icon="comment"
                iconPosition="left"
                onChange={ev => setcommenttext(ev.target.value)}
            />
        </Form>
    );
}
