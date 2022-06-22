import React from "react";
import NavBar from "../NavBar";
import LastCreated from "./LastCreated";
// import LastModified from "./LastModified";
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
                <RecentComments />
                <div style={{ marginTop: "2rem" }}>
                    <Grid stackable columns={2}>
                        <Grid.Column>
                            <Grid stackable columns={2}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <LastCreated />
                                    </Grid.Column>
                                    <Grid.Column>
                                        <RecentPositions />
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column>
                                        <AtRiskEmployees />
                                    </Grid.Column>
                                    <Grid.Column></Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Grid.Column>
                        <Grid.Column>
                            <RecentSubmissions />
                        </Grid.Column>
                    </Grid>
                </div>
            </Container>
        </div>
    );
};
