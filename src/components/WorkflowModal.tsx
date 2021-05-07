import React, { useEffect, useState } from "react";
import { State, useSharedState } from "../State";

import { Button, Modal, Spinner } from "react-bootstrap";
import ClientSingleton from "../api/ClientSingleton";
import { IPluginCreateData } from "@fnndsc/chrisapi";

interface ModalProps {
	show: boolean;
	onHide(): void;
}

interface IDirCreateData extends IPluginCreateData {
	dir: string;
}

interface IFSHackData extends IPluginCreateData {
	inputFile: string;
	outputFile: string;
	exec: string;
	args: string;
}

interface IMedImgData extends IPluginCreateData {
	inputFile: string;
	outputFileStem: string;
	sliceToConvert: number;
}

function WorkflowModal(props: ModalProps): JSX.Element {
	const [state, setState] = useSharedState();

	async function runWorkflow(): Promise<void> {
		const client = await ClientSingleton.getInstance();
		const uploadedFileName = state.uploadedFile.data.fname.split("/").pop();

		// parent node: pl-dircopy
		const dircopyLookup = await client.getPlugins({ name: "pl-dircopy" });
		const dircopyPlugin = await dircopyLookup.getItems()[0];
		const dircopyArguments: IDirCreateData = {
			title: "InfantFS segmentation analysis",
			dir: state.uploadedFile.data.fname,
		};
		const dircopyInstance = await client.createPluginInstance(
			dircopyPlugin.data.id,
			dircopyArguments
		);

		// child node: pl-med2img
		const med2imgLookup = await client.getPlugins({ name: "pl-med2img" });
		const med2imgPlugin = await med2imgLookup.getItems()[0];
		const med2imgArguments: IMedImgData = {
			title: "Input visual",
			previous_id: dircopyInstance.data.id,
			inputFile: uploadedFileName,
			outputFileStem: `${uploadedFileName}.png`,
			sliceToConvert: 0,
		};
		const med2imgInstance = await client.createPluginInstance(
			med2imgPlugin.data.id,
			med2imgArguments
		);

		// child node: pl-fshack-infant
		const infantfsLookup = await client.getPlugins({
			name: "pl-fshack-infant",
		});
		const infantfsPlugin = await infantfsLookup.getItems()[0];
		const infantfsArguments: IFSHackData = {
			previous_id: dircopyInstance.data.id,
			title: "InfantFS",
			inputFile: uploadedFileName,
			outputFile: "test",
			exec: "recon-all",
			args: "'{ -all }'",
		};
		const infantfsInstance = await client.createPluginInstance(
			infantfsPlugin.data.id,
			infantfsArguments
		);
	}

	useEffect(() => {
		if (state.username && state.uploadedFile) {
			runWorkflow();
		}
	}, [state.showWorkflow, setState]);

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
			backdrop="static"
			size="lg"
			centered
		>
			{modalHeader}
			{modalBody}
			{modalFooter}
		</Modal>
	);
}

export default WorkflowModal;
