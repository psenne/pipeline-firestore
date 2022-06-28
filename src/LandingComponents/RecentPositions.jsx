import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fbPositionsDB } from "../firebase.config";
import { Container, List, Header, Icon } from "semantic-ui-react";
import ComponentPlaceholder from "./ComponentPlaceholder";
import { format } from "date-fns";
import tmplPosition from "../constants/positionInfo";

const RecentPositions = () => {
    const [orderedPositions, setorderedPositions] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        setpageloading(true);
        const getPositions = fbPositionsDB
            .where("added_on", "!=", "")
            .orderBy("added_on", "desc")
            .limit(5)
            .onSnapshot(data => {
                let tmpitems = [];
                data.forEach(function (position) {
                    tmpitems.push({ key: position.id, info: Object.assign({}, tmplPosition, position.data()) });
                });
                setorderedPositions(tmpitems);
                setpageloading(false);
            });
        return () => getPositions();
    }, []);

    return (
        <Container>
            <Header>
                <Icon name="briefcase" />
                New Positions
            </Header>
            {pageloading ? (
                <ComponentPlaceholder lines="6" />
            ) : (
                <List selection verticalAlign="middle" divided relaxed>
                    {orderedPositions.map(({ info, key }) => {
                        const added_on = info.added_on ? "added on " + format(info.added_on.toDate(), "MMM d, yyyy") : "";

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
