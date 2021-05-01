import React from 'react';
import './UploadButton.css';

function UploadButton(): JSX.Element {
	return (
		<div className="uploadButton">
			<h1>Upload A .NII or .DCM Dataset</h1>
            <button>Upload.</button>
		</div>
	);
}

export default UploadButton;