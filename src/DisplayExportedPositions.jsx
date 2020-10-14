import React from 'react';
import { ExportPositions } from "./ConvertPositions";

const DisplayExportedPositions = () => {
    return (
        <div>
            <button onClick={ExportPositions}>Export Positions</button>
        </div>
    );
};

export default DisplayExportedPositions;