import React from "react";
import { SignOut } from "./firebase.config";
import UserContext from "./contexts/UserContext";

import { Image, Menu } from "semantic-ui-react";
import * as logo from "./images/RenegadeLogo_white_transparent.png";

const AppHeader = ({ currentuser }) => (
    <Menu borderless stackable inverted className="no-print">
        <Menu.Item header>
            <a href="/">
                <Image src={logo} className="header-logo" />
            </a>
        </Menu.Item>
        <Menu.Menu position="right">
            <Menu.Item>
                <UserContext.Consumer>
                    {currentuser => (
                        <span title="Log off" className="avatar floated-right" onClick={SignOut}>
                            <Image src={currentuser.photoURL} className="cursored" avatar size="mini" verticalAlign="middle" spaced />
                            {currentuser.email}
                        </span>
                    )}
                </UserContext.Consumer>
            </Menu.Item>
        </Menu.Menu>
    </Menu>
);

export default AppHeader;
