import React from "react";
import { Placeholder } from "semantic-ui-react";

const createRows = rows => {
    const table = [];

    // Outer loop to create parent
    for (var i = 0; i < rows; i++) {
        table.push(<Placeholder.Line key={i} />);
    }
    return table;
};

const ComponentPlaceholder = ({ lines }) => {
    const rows = Number(lines) || 1;
    return (
        <Placeholder>
            <Placeholder.Paragraph>{createRows(rows)} </Placeholder.Paragraph>
        </Placeholder>
    );
};

export default ComponentPlaceholder;
