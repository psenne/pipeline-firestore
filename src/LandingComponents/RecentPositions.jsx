import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fbPositionsDB } from "../firebase.config";
import { Container, List } from "semantic-ui-react";
import ComponentPlaceholder from "./ComponentPlaceholder";
import { format, parseISO } from "date-fns";
import tmplPosition from "../constants/positionInfo";

const RecentPositions = () => {
    const [orderedPositions, setorderedPositions] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        setpageloading(true);
        const getPositions = fbPositionsDB
            .orderByChild("added_on")
            .limitToLast(5)
            .on("value", data => {
                let tmpitems = [];
                data.forEach(function(position) {
                    tmpitems.push({ key: position.key, info: Object.assign({}, tmplPosition, position.val()) });
                });
                setorderedPositions(tmpitems);
                setpageloading(false);
            });
        return () => fbPositionsDB.off("value", getPositions);
    }, []);

    return (
        <Container>
            <h3>Recently added positions</h3>
            {pageloading ? (
                <ComponentPlaceholder lines="6" />
            ) : (
                <List selection verticalAlign="middle" divided relaxed>
                    {orderedPositions.reverse().map(({ info, key }) => {
                        const added_on = info.added_on ? "added on " + format(parseISO(info.added_on), "MMM d, yyyy") : "";

                        return (
                            <List.Item key={key}>
                                <List.Content>
                                    <List.Header>
                                        <Link to={`/positions/${key}`}>
                                            {info.contract} - {info.title}
                                        </Link>
                                    </List.Header>
                                    <List.Description>
                                        {info.skill_summary} {added_on}
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        );
                    })}
                </List>
            )}
        </Container>
    );
};

export default RecentPositions;
