import { useState, useEffect } from "react";
import { initialState, State, useSharedState } from "../State";
import ClientSingleton from "../api/ClientSingleton";
import { Button, Modal, ModalProps, ProgressBar } from "react-bootstrap";
import { IDirCreateData, IMedImgData, IFSHackData } from "../api/interfaces";

export default function WorkflowModal(props: ModalProps): JSX.Element {
	const [state, setState] = useSharedState();
	const [stage, setStage] = useState(0);

	useEffect(() => {
		if (state.showWorkflow && state.uploadedFile) {
			setState((prev: State) => {
				return {
					...prev,
					selectedFile: initialState.selectedFile,
				};
			});
			runWorkflow();
		}
	}, [state.showWorkflow]);

	async function runWorkflow(): Promise<void> {
		const client = await ClientSingleton.getInstance();
		const uploadedFileName = state.uploadedFile.data.fname.split("/").pop();

		// parent node: pl-dircopy
		const dircopyLookup = await client.getPlugins({ name: "pl-dircopy" });
		const dircopyPlugin = await dircopyLookup.getItems()[0];
		const dircopyArguments: IDirCreateData = {
			title: "InfantFS analysis",
			dir: state.uploadedFile.data.fname,
		};
		const dircopyInstance = await client.createPluginInstance(
			dircopyPlugin.data.id,
			dircopyArguments
		);
		setStage(1);

		// child node: pl-med2img
		const med2imgLookup = await client.getPlugins({ name: "pl-med2img" });
		const med2imgPlugin = await med2imgLookup.getItems()[0];
		const med2imgArguments: IMedImgData = {
			title: "Input image",
			previous_id: dircopyInstance.data.id,
			inputFile: uploadedFileName,
			outputFileStem: `${uploadedFileName}.png`,
			sliceToConvert: "m",
		};
		const med2imgInstance = await client.createPluginInstance(
			med2imgPlugin.data.id,
			med2imgArguments
		);
		setStage(2);

		// child node: pl-fshack-infant
		const infantfsLookup = await client.getPlugins({
			name: "pl-fshack-infant",
		});
		const infantfsPlugin = await infantfsLookup.getItems()[0];
		const infantfsArguments: IFSHackData = {
			previous_id: dircopyInstance.data.id,
			title: "InfantFS",
			inputFile: uploadedFileName,
			outputFile: "output",
			exec: "recon-all",
			args: "'{ -all }'",
		};
		const infantfsInstance = await client.createPluginInstance(
			infantfsPlugin.data.id,
			infantfsArguments
		);
		setStage(3);
	}

	function workflowStage(): JSX.Element {
		let text: string, variant: string, percent: number;
		switch (stage) {
			case 0:
				text = "Copying file...";
				percent = 0;
				break;
			case 1:
				text = "Generating image...";
				percent = 33;
				break;
			case 2:
				text = "Running Infant FreeSurfer...";
				percent = 66;
				break;
			case 3:
				text = "Feed created successfully! Check the Results page.";
				percent = 100;
				variant = "success";
				//setTimeout(function () {
				//	props.onHide();
				//}, 10000);
				break;
		}
		return (
			<>
				<div>{text}</div>
				<ProgressBar
					style={{ width: "100%", height: "36px" }}
					variant={variant}
					now={percent}
					animated
				/>
			</>
		);
	}

	return (
		<Modal
			show={props.show}
			onHide={props.onHide}
			backdrop="static"
			centered
		>
			<Modal.Header className="d-flex justify-content-center">
				<Modal.Title>Preparing analysis...</Modal.Title>
			</Modal.Header>
			<Modal.Body className="d-flex justify-content-center">
				<div className="py-3">
					{workflowStage()}
					{/*<Spinner
					animation="border"
					style={{ width: "8rem", height: "8rem" }}
				/>*/}
				</div>
			</Modal.Body>
		</Modal>
	);
}