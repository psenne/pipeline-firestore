import React, { useState } from "react";
import { Icon, List } from "semantic-ui-react";
import { fbStorage } from "../firebase.config";

export default function File({ deletable, link }) {
    const id = link.id;
    const [filename, setfilename] = useState(link.filename);
    const [url, seturl] = useState(link.url);

    const DeleteFile = ev => {
        if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
            fbStorage
                .child(`${id}/${filename}`)
                .delete()
                .then(() => {
                    setfilename("");
                    seturl("");
                })
                .catch(err => console.error("File, line 15", err));
        }
    };

    if (!filename) {
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
