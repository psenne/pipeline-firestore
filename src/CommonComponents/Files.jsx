import React, { useState, useEffect } from "react";
import { fbStorage } from "../firebase.config";
import File from "./File";
import { List } from "semantic-ui-react";

export default function Files({ id, filenames, deletable = false, onDelete }) {
    const [links, setlinks] = useState(null);

    useEffect(() => {
        fetchFiles(id, filenames);
    }, [id, filenames]);

    const fetchFiles = (id, filenames) => {
        let getdocumenturls = filenames.map(filename => {
            return fbStorage
                .child(id + "/" + filename)
                .getDownloadURL()
                .then(url => {
                    return {
                        url,
                        filename
                    };
                });
        });
        Promise.all(getdocumenturls)
            .then(newlinks => setlinks(newlinks))
            .catch(err => {
                setlinks(null);
                if (err.code_ !== "storage/object-not-found") console.error("Document not found. Probably not uploaded yet.");
            });
    };

    return (
        <List>
            {links &&
                links.map((link, i) => {
                    return <File key={i} link={link} deletable={deletable} onDelete={onDelete} />;
                })}
        </List>
    );
}
