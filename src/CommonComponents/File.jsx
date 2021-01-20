import React, { Component } from "react";
import { fbStorage, fbCandidatesDB } from "../firebase.config";
import { Icon, List } from "semantic-ui-react";

export default class File extends Component {
    constructor(props) {
        super(props);

        this.DeleteFile = this.DeleteFile.bind(this);
    }

    DeleteFile(ev, filename) {
        ev.stopPropagation();
        ev.preventDefault();
        const { candidateID, filenames } = this.props;
        const newFilenames = filenames.filter(f => f !== filename);

        if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
            fbStorage
                .child(candidateID + "/" + filename)
                .delete()
                .then(() => {
                    fbCandidatesDB.doc(candidateID).update({ filenames: newFilenames });
                })
                .catch(err => console.error("File, line 25", err));
        }
    }

    render() {
        const { deletable, link } = this.props;
        return (
            <List.Item as="a" href={link.url}>
                <List.Content>
                    <List.Header>
                        <Icon name="paperclip" />
                        {link.filename}
                        {deletable && <Icon name="close" color="red" title="Click to delete document" onClick={ev => this.DeleteFile(ev, link.filename)} />}
                    </List.Header>
                </List.Content>
            </List.Item>
        );
    }
}
