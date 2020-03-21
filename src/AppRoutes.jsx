import React, { Suspense, lazy } from "react";
import { Route, Switch, Router } from "react-router-dom";
import history from "./modules/history";
import UserContext from "./contexts/UserContext";

import { Loader, Dimmer } from "semantic-ui-react";
import "semantic-ui-css/semantic.css";

const LandingPage = lazy(() => import("./LandingComponents/LandingPage"));
const CandidatesPage = lazy(() => import("./CandidateComponents/CandidatesPage"));
const CandidateDetailPage = lazy(() => import("./CandidateComponents/CandidateDetailPage"));
const AddCandidateForm = lazy(() => import("./CandidateComponents/AddCandidateForm"));
const EditCandidateForm = lazy(() => import("./CandidateComponents/EditCandidateForm"));
const AdminPage = lazy(() => import("./AdminComponents/AdminPage"));
const LoginHistory = lazy(() => import("./AdminComponents/LoginHistory"));
const PositionsPage = lazy(() => import("./JobComponents/PositionsPage"));
const AddPositionForm = lazy(() => import("./JobComponents/AddPositionForm"));
const EditPositionForm = lazy(() => import("./JobComponents/EditPositionForm"));
const DisplayExportedCandidates = lazy(() => import("./DisplayExportedCandidates"));
const NoMatch = lazy(() => import("./nomatch"));

export default function AppRoutes() {
    return (
        <Router history={history}>
            <Suspense
                fallback={
                    <Dimmer>
                        <Loader>Loading...</Loader>
                    </Dimmer>
                }>
                <UserContext.Consumer>
                    {currentuser => (
                        <>
                            <Switch>
                                <Route exact path="/" render={props => <LandingPage {...props} />} />
                                <Route path="/admin" render={props => <AdminPage {...props} />} />
                                <Route path="/candidates/add" render={props => <AddCandidateForm currentuser={currentuser} {...props} />} />
                                <Route exact path="/candidates/:id/edit" render={props => <EditCandidateForm currentuser={currentuser} {...props} />} />
                                <Route path="/candidates/:id" render={props => <CandidateDetailPage currentuser={currentuser} {...props} />} />
                                <Route path="/candidates" render={props => <CandidatesPage {...props} />} />
                                <Route path="/positions/add" render={props => <AddPositionForm currentuser={currentuser} {...props} />} />
                                <Route exact path="/positions/:id" render={props => <EditPositionForm currentuser={currentuser} {...props} />} />
                                <Route path="/positions" render={props => <PositionsPage {...props} />} />
                                <Route path="/loginhistory" render={props => <LoginHistory {...props} />} />
                                <Route path="/export" render={props => <DisplayExportedCandidates {...props} />} />
                                <Route render={() => <NoMatch />} />
                            </Switch>
                        </>
                    )}
                </UserContext.Consumer>
            </Suspense>
        </Router>
    );
}
