import React from "react";
import { Placeholder, Segment } from "semantic-ui-react";

export default function LoadingCandidatesTable({ numrows }) {
    numrows = numrows || 4;
    const rows = [];

    for (var i = 0; i < numrows; i++) {
        rows.push(
            <Segment key={i} padded>
                <Placeholder>
                    <Placeholder.Header>
                        <Placeholder.Line />
                        <Placeholder.Line />
                    </Placeholder.Header>
                    <Placeholder.Paragraph>
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                    </Placeholder.Paragraph>
                    <Placeholder.Paragraph>
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                    </Placeholder.Paragraph>
                </Placeholder>
            </Segment>
        );
    }
    return rows;
}
