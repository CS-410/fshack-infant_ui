import React, { useState } from "react";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import FormLabel from "react-bootstrap/FormLabel";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

import ClientSingleton from "../ClientSingleton";

import brainImage from "../assets/brain.svg";

function Upload(): JSX.Element {
	const [selectedFile, setSelectedFile] = useState<File>();
	const instance = ClientSingleton.getInstance();

	function onFileUpload(): void {
		const client = instance.getClient();
		const username = instance.getUsername();
		const filename = selectedFile.name;
		client.uploadFile(
			{
				upload_path: username + "/uploads/pl-fshack-infant/" + filename,
			},
			{
				fname: filename,
			}
		);
	}

	function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
		setSelectedFile(event.target.files[0]);
	}

	function butt(): JSX.Element {
		if (instance.isAuthorized()) {
			return (
				<Button
					variant="success"
					onClick={onFileUpload}
					style={{ width: "100%" }}
				>
					Continue
				</Button>
			);
		} else {
			return (
				<Button variant="danger" style={{ width: "100%" }} disabled>
					Login first
				</Button>
			);
		}
	}

	return (
		<Col>
			<Container>
				<Alert variant="primary" className="text-center">
					<br />
					{selectedFile && (
						<h5>
							<b>Selected file:</b> {selectedFile.name}
						</h5>
					)}
					<br />
					<img
						style={{ filter: "brightness(0) invert(1)" }}
						src={brainImage}
						width="50%"
					/>
					<br />
					<br />
					<br />
					<FormLabel className="btn btn-lg btn-primary">
						<input
							type="file"
							onChange={onFileChange}
							className="d-none"
						/>
						Upload <b>.NII</b> or <b>.DCM</b> dataset
					</FormLabel>
					<br />
					<br />
					{selectedFile && (
						<>
							<hr />
							<div className="d-flex justify-content-center">
								{butt()}
							</div>
						</>
					)}
				</Alert>
			</Container>
		</Col>
	);
}

export default Upload;
