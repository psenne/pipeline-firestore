import React from "react";
import NavBar from "../NavBar";
import LastCreated from "./LastCreated";
import LastModified from "./LastModified";
import FlaggedCandidates from "./FlaggedCandidates";
import RecentPositions from "./RecentPositions";
import RecentSubmissions from "./RecentSubmissions";
import { Container, Grid } from "semantic-ui-react";

export default () => {
    return (
        <>
            <NavBar active="dashboard" />
            <Container>
                <Grid stackable columns="equal">
                    <Grid.Row>
                        <FlaggedCandidates />
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <RecentPositions />
                        </Grid.Column>
                        <Grid.Column>
                            <RecentSubmissions />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <LastCreated />
                        </Grid.Column>
                        <Grid.Column>
                            <LastModified />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </>
    );
};
