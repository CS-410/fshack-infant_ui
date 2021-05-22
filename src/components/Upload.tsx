import React from "react";
import { State, useSharedState } from "../shared/state";
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
import { IRequestData, IUploadFileObj } from "@fnndsc/chrisapi";

export default function Upload(): JSX.Element {
	const [state, setState] = useSharedState();

	async function onFileUpload(): Promise<void> {
		const client = await ClientSingleton.getInstance();
		const requestData: IRequestData = {
			upload_path: `${state.username}/uploads/pl-fshack-infant/${state.selectedFile.name}`,
		};
		const uploadFileObj: IUploadFileObj = {
			fname: state.selectedFile,
		};
		const uploadedFile = await client.uploadFile(
			requestData,
			uploadFileObj
		);
		setState((prev: State) => {
			return {
				...prev,
				uploadedFile: uploadedFile,
				showWorkflow: true,
			};
		});
	}

	function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
		setState((prev: State) => {
			return {
				...prev,
				selectedFile: event.target.files[0],
			};
		});
	}

	function getActionButton(): JSX.Element {
		function isValidFile(): boolean {
			const fileExt = state.selectedFile.name.split(".").pop();
			return (
				(fileExt === "nii" || fileExt === "dcm") &&
				state.selectedFile.size !== 0
			);
		}

		let text,
			variant,
			onClick,
			disabled = false;
		const validFile: boolean = isValidFile();

		if (state.username && validFile) {
			text = "Continue";
			variant = "success";
			onClick = onFileUpload;
		} else if (!validFile) {
			text = "Invalid file, try again";
			variant = "danger";
			disabled = true;
		} else {
			text = "Login to continue";
			variant = "outline-danger";
			disabled = true;
		}

		return (
			<Button
				variant={variant}
				style={{ width: "100%" }}
				disabled={disabled}
				onClick={onClick}
			>
				{text}
			</Button>
		);
	}

	function truncateFileName(name: String): String {
		const maxLength = 17;
		const shortenedName =
			name.length > maxLength
				? `${name.substring(0, maxLength)}[...]${name.substring(
						name.length - 4
				  )}`
				: name;
		return shortenedName;
	}

	function hideWorkflowModal(): void {
		setState((prev: State) => {
			return {
				...prev,
				showWorkflow: false,
			};
		});
	}

	return (
		<>
			<Col md={5}>
				<Container>
					<Alert variant="primary" className="text-center pt-5">
						{state.selectedFile && (
							<h5>
								<span title={state.selectedFile.name}>
									<b>Selected file:</b>{" "}
									{truncateFileName(state.selectedFile.name)}
								</span>
							</h5>
						)}
						<Image
							style={{
								filter: "brightness(0) invert(1)",
								width: "60%",
							}}
							className="py-5"
							src={brainImage}
						/>
						<FormLabel className="btn btn-lg btn-primary">
							<input
								className="d-none"
								type="file"
								onChange={onFileChange}
							/>
							Upload <b>.NII</b> or <b>.DCM</b> dataset
						</FormLabel>
						<br />
						<br />
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
