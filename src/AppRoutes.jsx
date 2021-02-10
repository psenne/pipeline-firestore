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
const EmployeesPage = lazy(() => import("./EmployeeComponents/EmployeesPage"));
const PositionsPage = lazy(() => import("./JobComponents/PositionsPage"));
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
                                <Route path="/employees">
                                    <EmployeesPage />
                                </Route>
                                <Route path="/positions">
                                    <PositionsPage />
                                </Route>
                                <Route path="*">
                                    <NoMatch />
                                </Route>
                            </Switch>
                        </>
                    )}
                </UserContext.Consumer>
            </Suspense>
        </Router>
    );
}
