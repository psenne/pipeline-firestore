import React from "react";
import { Icon, List } from "semantic-ui-react";

export default function File(props) {
    const { deletable, link } = props;
    return (
        <List.Item as="a" href={link.url}>
            <List.Content>
                <List.Header>
                    <Icon name="paperclip" />
                    {link.filename}
                    {deletable && <Icon name="close" color="red" title="Click to delete document" onClick={ev => props.onDelete(ev, link.filename)} />}
                </List.Header>
            </List.Content>
        </List.Item>
    );
}
