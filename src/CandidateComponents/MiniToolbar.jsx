import React from "react";
import { fbCandidatesDB, fbFlagNotes } from "../firebase.config";
import history from "../modules/history";
import { format, parseISO } from "date-fns";
import classnames from "classnames";
import FlagMessagePopup from "../CommonComponents/FlagMessagePopup";
import UserContext from "../contexts/UserContext";
import { Icon, Menu } from "semantic-ui-react";

export default class MiniToolbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            flagOpen: false
        };

        this.ShowMenu = this.ShowMenu.bind(this);
        this.HideMenu = this.HideMenu.bind(this);
        this.openFlagMessage = this.openFlagMessage.bind(this);
        this.closeFlagMessage = this.closeFlagMessage.bind(this);
        this.ArchiveCandidate = this.ArchiveCandidate.bind(this);
    }

    openFlagMessage(ev) {
        ev.stopPropagation();
        this.setState({
            flagOpen: true
        });
    }

    closeFlagMessage() {
        this.setState({
            flagOpen: false
        });
    }

    ShowMenu(ev) {
        ev.stopPropagation();
        setTimeout(() => {
            this.setState({
                visible: true
            });
        }, 100);
    }

    HideMenu(ev) {
        ev.stopPropagation();
        this.setState({
            visible: false
        });
    }

    ArchiveCandidate(ev) {
        ev.stopPropagation();

        const { ckey, candidate } = this.props;

        let updatedinfo;
        if (candidate.archived === "current") {
            //remove flag if setting canddiate to archived. Otherwise there's no way to filter the FlaggedCandidates cpnt.
            updatedinfo = {
                archived: "archived",
                isFlagged: false,
                flagged_by: "",
                flag_note: "",
                flagged_on: "",
                actioned_to: ""
            };
            fbFlagNotes.child(ckey).remove();
        } else {
            updatedinfo = {
                archived: "current"
            };
        }

        fbCandidatesDB
            .doc(ckey)
            .update(updatedinfo)
            .catch(err => console.error("CandidatesPage, line 102: ", err));
    }

    render() {
        const { ckey, candidate, attached } = this.props;
        const { flagOpen } = this.state;
        const flagDate = candidate.flagged_on ? format(parseISO(candidate.flagged_on), "M/d/yyyy") : "";
        const flagNote = `${candidate.flagged_by} (${flagDate}): ${candidate.flag_note}`;
        const title = candidate.flag_note ? flagNote : "Add follow up note";
        const setArchiveStatusText = candidate.archived === "archived" ? "Unarchive" : "Archive";

        return (
            <Menu attached={attached} icon className={classnames("minitoolbar-inline")}>
                <UserContext.Consumer>
                    {currentuser => (
                        <FlagMessagePopup open={flagOpen} flagkey={ckey} currentuser={currentuser} handleClose={this.closeFlagMessage}>
                            <Menu.Item name="flag" className={classnames({ "minitoolbar-switch-flagged": candidate.isFlagged }, "minitoolbar-flag")} title={title} onClick={this.openFlagMessage}>
                                <Icon link name="flag" />
                            </Menu.Item>
                        </FlagMessagePopup>
                    )}
                </UserContext.Consumer>
                <Menu.Item
                    name="edit"
                    title="Edit candidate"
                    className="minitoolbar-edit"
                    onClick={ev => {
                        ev.stopPropagation();
                        history.push(`/candidates/${ckey}/edit`);
                    }}>
                    <Icon link name="edit" />
                </Menu.Item>
                <Menu.Item name="archive" className="minitoolbar-archive" title={`${setArchiveStatusText} candidate`} onClick={this.ArchiveCandidate}>
                    <Icon link name="archive" />
                </Menu.Item>
            </Menu>
        );
    }
}
