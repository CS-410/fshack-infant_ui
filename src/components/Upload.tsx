import React, { useState } from "react";
import {
	Alert,
	Button,
	Col,
	Container,
	FormLabel,
	Image,
} from "react-bootstrap";

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
		<Col md={5}>
			<Container>
				<Alert variant="primary" className="text-center py-3">
					{selectedFile && (
						<h5>
							<b>Selected file:</b> {selectedFile.name}
						</h5>
					)}
					<Image
						style={{ filter: "brightness(0) invert(1)" }}
						src={brainImage}
						width="50%"
						className="mb-3"
					/>
					<FormLabel className="btn btn-lg btn-primary">
						<input
							type="file"
							onChange={onFileChange}
							className="d-none"
						/>
						Upload <b>.NII</b> or <b>.DCM</b> dataset
					</FormLabel>
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
