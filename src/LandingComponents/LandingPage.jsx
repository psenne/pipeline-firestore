import React from "react";
import NavBar from "../NavBar";
import LastCreated from "./LastCreated";
import LastModified from "./LastModified";
import FlaggedCandidates from "./FlaggedCandidates";
import RecentPositions from "./RecentPositions";
import RecentSubmissions from "./RecentSubmissions";
import { Container, Grid } from "semantic-ui-react";
import AtRiskEmployees from "./AtRiskEmployees";
import RecentComments from "./RecentComments";
import Stats from "./Stats";

export default () => {
    return (
        <div className="view-panel">
            <NavBar active="dashboard" />
            <Container fluid>
                <Stats />
                <FlaggedCandidates />
                <Grid stackable columns={3}>
                    <Grid.Row>
                        <Grid.Column>
                            <LastCreated />
                        </Grid.Column>
                        <Grid.Column>
                            <LastModified />
                        </Grid.Column>
                        <Grid.Column>
                            <RecentSubmissions />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <RecentPositions />
                        </Grid.Column>
                        <Grid.Column>
                            <AtRiskEmployees />
                        </Grid.Column>
                        <Grid.Column>
                            <RecentComments />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </div>
    );
};
