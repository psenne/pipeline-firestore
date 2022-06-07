import React from "react";
import { Icon, List } from "semantic-ui-react";

export default function File({ deletable, link, onDelete }) {
    return (
        <List.Item>
            <List.Content>
                <List.Header>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <Icon name="paperclip" />
                        {link.filename}
                    </a>
                    {deletable && <Icon name="close" color="red" title="Click to delete document" onClick={ev => onDelete(ev, link.filename)} />}
                </List.Header>
            </List.Content>
        </List.Item>
    );
}
