import React from "react";
import { Placeholder, Icon } from "semantic-ui-react";

function CommentLoader({ isLoading }) {
    isLoading && <Placeholder />;
}

export default CommentLoader;
