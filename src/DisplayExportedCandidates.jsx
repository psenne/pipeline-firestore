import React from 'react';
import {ExportCandidates} from './ConvertCandidate';

const DisplayExportedCandidates = () => {
    return (
        <div>
            <button onClick={ExportCandidates}>Export Candidates</button>
        </div>
    );
};

export default DisplayExportedCandidates;