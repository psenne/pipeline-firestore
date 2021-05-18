import React from "react";
import { formatDistance } from "date-fns";
import { Comment as SUIComment } from "semantic-ui-react";
import Markdown from "markdown-to-jsx";

function Comment({ comment }) {
    const comment_date = comment.comment_date ? formatDistance(comment.comment_date.toDate(), new Date(), { addSuffix: true }) : "";
    return (
        <SUIComment>
            <SUIComment.Avatar src={comment.avatar || ""} />
            <SUIComment.Content>
                <SUIComment.Author as="a">{comment.author}</SUIComment.Author>
                <SUIComment.Metadata>
                    <div>{comment_date}</div>
                </SUIComment.Metadata>
                <SUIComment.Text>
                    <Markdown>{comment.text}</Markdown>
                </SUIComment.Text>
            </SUIComment.Content>
        </SUIComment>
    );
}

export default Comment;
