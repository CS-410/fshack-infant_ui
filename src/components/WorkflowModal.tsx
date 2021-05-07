import { useEffect } from "react";
import { useSharedState } from "../State";

import { Button, Modal, Spinner } from "react-bootstrap";
import ChrisIntegration from "../services/chris_integration";

export interface ModalProps {
	show: boolean;
	onHide(): void;
}

function WorkflowModal(props: ModalProps): JSX.Element {
	const [state, setState] = useSharedState();

	useEffect(() => {
		const uploadedFile = state.uploadedFile;
		const processedSuccessfully = ChrisIntegration.createFeed(uploadedFile);

		if (processedSuccessfully) {
			console.log("Created feed successfully");
		} else {
			console.log("Feed creation was unsuccessful");
		}
	}, [state.showWorkflow, state.uploadedFile]);

	const modalHeader = (
		<Modal.Header className="d-flex justify-content-center">
			<Modal.Title>Preparing brain segmentation analysis...</Modal.Title>
		</Modal.Header>
	);

	const modalBody = (
		<Modal.Body className="d-flex justify-content-center">
			<div className="py-3">
				<Spinner
					animation="border"
					style={{ width: "8rem", height: "8rem" }}
				/>
			</div>
		</Modal.Body>
	);

	const modalFooter = (
		<Modal.Footer>
			<Button
				variant="outline-danger"
				style={{ width: "100%" }}
				onClick={props.onHide}
			>
				Cancel
			</Button>
		</Modal.Footer>
	);

	return (
		<Modal
			show={props.show}
			onHide={props.onHide}
			centered
			backdrop="static"
			size="lg"
		>
			{modalHeader}
			{modalBody}
			{modalFooter}
		</Modal>
	);
}

export default WorkflowModal;
