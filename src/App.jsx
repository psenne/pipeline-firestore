import React, { Component } from "react";
import { fbUsersDB, fbauth, SignInWithGoogle, SignInWithMicrosoft, SignOut, fbLoginsDB } from "./firebase.config";
import AppHeader from "./AppHeader";
import AppRoutes from "./AppRoutes";
import UserContext from "./contexts/UserContext";
import { CandidateTableFilters } from "./contexts/CandidateSearchContext";
import { PositionTableFilters } from "./contexts/PositionContext";
import { EmployeeTableFilters } from "./contexts/EmployeeContext";

import { Button, Container, Image, Loader, Dimmer } from "semantic-ui-react";
import "semantic-ui-css/semantic.css";
import "./index.css";
import * as logo from "./images/RenegadeLogo_transparent.png";

class App extends Component {
    constructor() {
        super();

        this.state = {
            loading: false,
            loadingMSG: ""
        };

        this.showLoader = this.showLoader.bind(this);
    }

    //callback function when form editing is done.
    showLoader(isLoading, msg) {
        msg = msg || "Loading Page...";

        this.setState({
            loading: isLoading,
            loadingMSG: msg
        });
    }

    componentDidMount() {
        fbauth.onAuthStateChanged(currentuser => {
            //called when logging in or out or when page is refreshed.
            if (currentuser) {
                fbUsersDB
                    .orderByChild("email")
                    .equalTo(currentuser.email)
                    .once("value", user => {
                        if (user.val()) {
                            this.setState({
                                currentuser: currentuser
                            }); //everything is good, so set current user and role

                            // save login event to logins table
                            const now = new Date();
                            fbLoginsDB.push({
                                user: currentuser.displayName,
                                emailaddress: currentuser.email,
                                eventtime: now.toJSON()
                            });
                        } else {
                            alert("User is not authorized.");
                            SignOut();
                        }
                    }); //end get users
            } else {
                //user logged out. reset app user state. shows login button.
                this.setState({
                    currentuser: null,
                    loading: false
                });
            }
        }); //end auth state change
    } //componentDidMount

    SignInGoogle() {
        this.showLoader(true, "Logging in...");
        SignInWithGoogle().then(() => {
            this.showLoader(false);
        });
    }

    SignInMicrosoft() {
        this.showLoader(true, "Logging in...");
        SignInWithMicrosoft().then(() => {
            this.showLoader(false);
        });
    }

    render() {
        const { currentuser, isLoading, loadingMSG } = this.state;

        if (!currentuser) {
            //user is not logged in. show google logon button.
            return (
                <Container className="App" fluid>
                    <Dimmer active={isLoading}>
                        <Loader>{loadingMSG}</Loader>
                    </Dimmer>
                    <div className="login-screen">
                        <Image src={logo} />
                        <Button className="login-button" content="Sign in with Google" color="google plus" icon="google" size="large" labelPosition="left" onClick={this.SignInGoogle.bind(this)} />
                        <Button className="login-button" content="Sign in with Outlook" color="blue" icon="microsoft" size="large" labelPosition="left" onClick={this.SignInMicrosoft.bind(this)} />
                    </div>
                </Container>
            );
        } else {
            //user is logged in
            return (
                <div className="App">
                    <EmployeeTableFilters>
                        <PositionTableFilters>
                            <CandidateTableFilters>
                                <UserContext.Provider value={currentuser}>
                                    <AppHeader />
                                    <AppRoutes />
                                </UserContext.Provider>
                            </CandidateTableFilters>
                        </PositionTableFilters>
                    </EmployeeTableFilters>
                </div>
            );
        }
    } //end render
} //end class

export default App;
