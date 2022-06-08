import React, { useState, useEffect } from "react";
import { fbStorage } from "../firebase.config";
import File from "./File";
import { List } from "semantic-ui-react";

export default function Files({ id, deletable = false }) {
    const [links, setlinks] = useState([]);

    useEffect(() => {
        fetchFiles(id);
    }, [id]);

    const fetchFiles = id => {
        fbStorage
            .child(id)
            .listAll()
            .then(filerefs => {
                var tmpitems = [];
                filerefs.items.forEach(item => {
                    item.getDownloadURL()
                        .then(url => {
                            tmpitems.push({ filename: item.name, url, id });
                            setlinks([...tmpitems]);
                        })
                        .catch(err => {
                            console.error(err);
                        });
                });
            });
    };
    return (
        <List>
            {links.map((link, i) => {
                return <File key={i} link={link} deletable={deletable} />;
            })}
        </List>
    );
}
