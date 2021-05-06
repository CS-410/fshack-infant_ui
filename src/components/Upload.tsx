import React from "react";
import { State, useSharedState } from "../State";

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
	const [state, setState] = useSharedState();

	function onFileUpload(): void {
		const client = ClientSingleton.getInstance();
		const username = state.username;
		const filename = state.selectedFile.name;
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
		setState((previous: State) => {
			return {
				...previous,
				selectedFile: event.target.files[0],
			};
		});
	}

	function actionButton(): JSX.Element {
		if (state.username) {
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
					Please login first
				</Button>
			);
		}
	}

	return (
		<Col md={5}>
			<Container>
				<Alert variant="primary" className="text-center py-3">
					{state.selectedFile && (
						<h5>
							<b>Selected file:</b> {state.selectedFile.name}
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
					{state.selectedFile && (
						<>
							<hr />
							<div className="d-flex justify-content-center">
								{actionButton()}
							</div>
						</>
					)}
				</Alert>
			</Container>
		</Col>
	);
}

export default Upload;
