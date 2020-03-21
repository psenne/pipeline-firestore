import React from "react";
import { Message } from "semantic-ui-react";

const noMatch = () => {
    return <Message icon="thumbs down" header="404" content="This page does not exist. " />;
};

export default noMatch;
