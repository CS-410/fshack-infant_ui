import React from "react";
import { State, useSharedState } from "../State";

import ClientSingleton from "../ClientSingleton";
import WorkflowModal from "./WorkflowModal";

import {
	Alert,
	Button,
	Col,
	Container,
	FormLabel,
	Image,
} from "react-bootstrap";

import brainImage from "../assets/brain.svg";

function Upload(): JSX.Element {
	const [state, setState] = useSharedState();

	function onFileUpload(): void {
		const client = ClientSingleton.getInstance();
		/*const uploadedFile = client.uploadFile(
			{
				upload_path:
					state.username +
					"/uploads/pl-fshack-infant/" +
					state.selectedFile.name,
			},
			{
				fname: state.selectedFile,
			}
		);*/
		showWorkflowModal();
	}

	function hideWorkflowModal(): void {
		setState((previous: State) => {
			return {
				...previous,
				showWorkflow: false,
			};
		});
	}

	function showWorkflowModal(): void {
		setState((previous: State) => {
			return {
				...previous,
				showWorkflow: true,
			};
		});
	}

	function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
		setState((previous: State) => {
			return {
				...previous,
				selectedFile: event.target.files[0],
			};
		});
	}

	function validateFile(): boolean {
		const fileExt = state.selectedFile.name.split(".").pop();
		return (
			(fileExt === "nii" || fileExt === "dcm") &&
			state.selectedFile.size !== 0
		);
	}

	function actionButton(): JSX.Element {
		const validFile: boolean = validateFile();
		if (state.username && validFile) {
			return (
				<Button
					variant="success"
					onClick={onFileUpload}
					style={{ width: "100%" }}
				>
					Continue
				</Button>
			);
		} else if (!validFile) {
			return (
				<Button
					variant="danger"
					onClick={onFileUpload}
					style={{ width: "100%" }}
					disabled
				>
					Invalid file, try again
				</Button>
			);
		} else {
			return (
				<Button
					variant="outline-danger"
					style={{ width: "100%" }}
					disabled
				>
					Login to continue
				</Button>
			);
		}
	}

	return (
		<>
			<Col md={5}>
				<Container className="py-3">
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
								<div className="justify-content-center">
									{actionButton()}
								</div>
							</>
						)}
					</Alert>
				</Container>
			</Col>
			<WorkflowModal
				show={state.showWorkflow}
				onHide={hideWorkflowModal}
			/>
		</>
	);
}

export default Upload;
