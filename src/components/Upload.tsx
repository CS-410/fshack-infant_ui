import React from "react";
import { State, useSharedState } from "../State";
import ClientSingleton from "../api/ClientSingleton";
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

	async function onFileUpload(): Promise<void> {
		const client = await ClientSingleton.getInstance();
		const uploadedFile = await client.uploadFile(
			{
				upload_path:
					state.username +
					"/uploads/pl-fshack-infant/" +
					state.selectedFile.name,
			},
			{
				fname: state.selectedFile,
			}
		);
		setState((previous: State) => {
			return {
				...previous,
				uploadedFile: uploadedFile,
				showWorkflow: true,
			};
		});
	}

	function hideWorkflowModal(): void {
		setState((previous: State) => {
			return {
				...previous,
				showWorkflow: false,
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

	function isValidFile(): boolean {
		const fileExt = state.selectedFile.name.split(".").pop();
		return (
			(fileExt === "nii" || fileExt === "dcm") &&
			state.selectedFile.size !== 0
		);
	}

<<<<<<< HEAD
	function truncateLongFileName(name: String): String {
		const longName = name;
		const shortenedName =
			name.length > 17
				? name.substring(0, 17) +
				  " (...) " +
				  name.substring(name.length - 4)
				: name;
		return shortenedName;
	}

	function actionButton(): JSX.Element {
=======
	function getActionButton(): JSX.Element {
>>>>>>> 90b0d646abb07172cb67416d549d10de2304f1d0
		const validFile: boolean = isValidFile();
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
								<span title={state.selectedFile.name}>
									<b>Selected file:</b> {truncateLongFileName(state.selectedFile.name)}
								</span>
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
									{getActionButton()}
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
