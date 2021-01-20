import React, { Component } from "react";
import { fbStorage } from "../firebase.config";
import File from "./File";
import { List } from "semantic-ui-react";

export default class Files extends Component {
    constructor(props) {
        super(props);

        this.state = {
            links: []
        };

        this.fetchFiles = this.fetchFiles.bind(this);
    }

    fetchFiles(candidateID, filenames) {
        let newlinks = [];
        filenames.forEach(filename => {
            fbStorage
                .child(candidateID + "/" + filename)
                .getDownloadURL()
                .then(url => {
                    newlinks.push({
                        url,
                        filename
                    });

                    this.setState({
                        links: newlinks
                    });
                })
                .catch(err => {
                    if (err.code_ !== "storage/object-not-found") console.error("Files, line 34: ", err);
                });
        });
    }

    componentDidMount() {
        const { candidateID, filenames } = this.props;
        this.fetchFiles(candidateID, filenames);
    }

    componentDidUpdate(prevProps) {
        const { filenames, candidateID } = this.props;
        if (prevProps.filenames.length !== filenames.length) {
            this.fetchFiles(candidateID, filenames);
        }
    }

    render() {
        const { links } = this.state;
        const { deletable, candidateID, filenames } = this.props;

        return (
            <List>
                {links.map(link => {
                    return <File key={link.filename} filenames={filenames} candidateID={candidateID} link={link} deletable={deletable} />;
                })}
            </List>
        );
    }
}
