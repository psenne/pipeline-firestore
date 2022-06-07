import React, { useState } from "react";
import { Icon, List } from "semantic-ui-react";
import { fbStorage } from "../firebase.config";

export default function File({ deletable, link }) {
    const filename = link.filename;
    const url = link.url;
    const id = link.id;

    const [hidden, sethidden] = useState(false);

    const DeleteFile = ev => {
        if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
            fbStorage
                .child(`${id}/${filename}`)
                .delete()
                .then(() => sethidden(true))
                .catch(err => console.error("File, line 15", err));
        }
    };

    if (hidden) {
        return null;
    }

    return (
        <List.Item>
            <List.Content>
                <List.Header>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <Icon name="paperclip" />
                        {filename}
                    </a>
                    {deletable && <Icon name="close" color="red" style={{ cursor: "pointer" }} title="Click to delete document" onClick={DeleteFile} />}
                </List.Header>
            </List.Content>
        </List.Item>
    );
}
