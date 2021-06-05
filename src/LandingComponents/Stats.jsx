import React from "react";
import { Grid } from "semantic-ui-react";
import StatsCandidates from "./StatsCandidates";
import StatsEmployees from "./StatsEmployees";
import StatsSubmissions from "./StatsSubmissions";

export default function Stats() {
    return (
        <Grid stackable columns={3}>
            <Grid.Column textAlign="center">
                <StatsCandidates />
            </Grid.Column>
            <Grid.Column textAlign="center">
                <StatsEmployees />
            </Grid.Column>
            <Grid.Column textAlign="center">
                <StatsSubmissions />
            </Grid.Column>
        </Grid>
    );
}
