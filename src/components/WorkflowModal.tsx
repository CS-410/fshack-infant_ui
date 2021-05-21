import { useState, useEffect } from "react";
import { initialState, State, useSharedState } from "../shared/state";
import ClientSingleton from "../api/ClientSingleton";
import { Button, Modal, ModalProps, ProgressBar } from "react-bootstrap";
import { IDirCreateData, IMedImgData, IFSHackData } from "../shared/interfaces";
import {
	dircopyPluginName,
	med2ImgPluginName,
	infantFSPluginName,
} from "../shared/constants";

export default function WorkflowModal(props: ModalProps): JSX.Element {
	const [state, setState] = useSharedState();
	const [stage, setStage] = useState(0);
	const [feedID, setFeedID] = useState<number>(null);

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
		const dircopyLookup = await client.getPlugins({
			name: dircopyPluginName,
		});
		const dircopyPlugin = await dircopyLookup.getItems()[0];
		const dircopyArguments: IDirCreateData = {
			title: "InfantFS analysis",
			dir: state.uploadedFile.data.fname,
		};
		const dircopyInstance = await client.createPluginInstance(
			dircopyPlugin.data.id,
			dircopyArguments
		);
		const feed = await dircopyInstance.getFeed();
		setFeedID(feed.data.id);
		setStage(1);

		// child node: pl-med2img
		const med2imgLookup = await client.getPlugins({
			name: med2ImgPluginName,
		});
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
			name: infantFSPluginName,
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
	function title(): any {
		if (stage === 3 && feedID) {
			return (
				<>
					Feed <b>{feedID}</b> created successfully!
				</>
			);
		} else {
			return "Preparing analysis...";
		}
	}

	function workflowStage(): JSX.Element {
		let text: any, percent: number, variant: string;
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
				text = "Initializing Infant FreeSurfer...";
				percent = 66;
				break;
			case 3:
				text = (
					<>
						Infant FreeSurfer will take multiple hours to complete
						the analysis.
						<br />
						<br />
						View the{" "}
						<a
							href={`/results/${feedID}`}
							style={{ textDecoration: "none" }}
						>
							Results
						</a>{" "}
						page to see its status.
					</>
				);
				percent = 100;
				variant = "success";
				break;
		}
		return (
			<div className="py-4 px-5 text-center" style={{ width: "100%" }}>
				{text}
				<br />
				<br />
				<ProgressBar
					style={{ height: "36px" }}
					variant={variant}
					now={percent}
					animated
				/>
			</div>
		);
	}

	return (
		<Modal
			show={props.show}
			onHide={props.onHide}
			backdrop="static"
			size="lg"
			centered
		>
			<Modal.Header className="justify-content-center">
				<Modal.Title>{title()}</Modal.Title>
			</Modal.Header>
			<Modal.Body>{workflowStage()}</Modal.Body>
			{stage === 3 && (
				<Modal.Footer>
					<Button
						variant="outline-danger"
						className="px-4"
						onClick={() => props.onHide()}
					>
						Close
					</Button>
				</Modal.Footer>
			)}
		</Modal>
	);
}
