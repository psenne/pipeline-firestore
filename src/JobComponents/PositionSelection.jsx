import React, { useState, useEffect } from "react";
import { fbPositionsDB } from "../firebase.config";
import tmplPosition from "../constants/positionInfo";
import LoadingPositionsTable from "./LoadingPositionsTable";
import { Form, Icon, Card, Divider, Container } from "semantic-ui-react";
import Markdown from "markdown-to-jsx";

//uses search field value to filter array of candidates for table population
function isSearched(s) {
    return function (item) {
        const searchTerm = s;
        let wasFound = true;

        s.split(" ").forEach(searchTerm => {
            let termFound = false;
            if (item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.position_id.toLowerCase().includes(searchTerm.toLowerCase()) || item.skill_summary.toLowerCase().includes(searchTerm.toLowerCase()) || item.contract.toLowerCase().includes(searchTerm.toLowerCase())) {
                termFound = true;
            }
            wasFound = wasFound && termFound;
        });

        return !searchTerm || wasFound;
    };
}

export default function PositionSelection({ onSelect }) {
    const [positions, updatePositions] = useState([]);
    const [searchterm, setsearchterm] = useState("");
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        var unsub = fbPositionsDB
            .orderBy("contract")
            .orderBy("position_id")
            .onSnapshot(data => {
                var tmppositions = [];
                data.forEach(doc => {
                    tmppositions.push({ key: doc.id, ...tmplPosition, ...doc.data() });
                });
                updatePositions(tmppositions);
            });

        return () => unsub();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setpageloading(!pageloading);
    }, [positions]); // eslint-disable-line react-hooks/exhaustive-deps

    const ClearFilters = () => {
        setsearchterm("");
    };

    const SubmitToPosition = position => {
        onSelect(position);
    };

    return (
        <Container>
            {pageloading && <LoadingPositionsTable />}
            {!pageloading && (
                <>
                    <Form>
                        <Form.Input placeholder="Filter positions..." icon={searchterm ? <Icon name="dont" color="red" link onClick={ClearFilters} /> : <Icon name="filter" />} value={searchterm} onChange={(ev, data) => setsearchterm(data.value)} />
                    </Form>
                    <Divider hidden />
                    <Card.Group centered itemsPerRow={1}>
                        {positions &&
                            positions.filter(isSearched(searchterm)).map(position => {
                                const position_id = position.position_id ? `(${position.position_id})` : "";
                                const contract = position.contract ? `${position.contract} ` : "";
                                const level = position.level ? position.level : "";
                                return (
                                    <Card key={position.key} link onClick={ev => SubmitToPosition(position)}>
                                        <Card.Content>
                                            <Card.Header>
                                                {level} {position.title}
                                            </Card.Header>
                                            <Card.Meta>
                                                {contract} {position_id}
                                            </Card.Meta>
                                            <Card.Description>
                                                <Markdown>{position.skill_summary}</Markdown>
                                            </Card.Description>
                                        </Card.Content>
                                    </Card>
                                );
                            })}
                    </Card.Group>
                </>
            )}
        </Container>
    );
}
