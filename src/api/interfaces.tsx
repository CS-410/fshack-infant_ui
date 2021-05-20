import { IPluginCreateData } from "@fnndsc/chrisapi";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export interface ModalProps {
	show: boolean;
	onHide(): void;
}

export interface IDirCreateData extends IPluginCreateData {
	dir: string;
}

export interface IFSHackData extends IPluginCreateData {
	inputFile: string;
	outputFile: string;
	exec: string;
	args: string;
}

export interface IMedImgData extends IPluginCreateData {
	inputFile: string;
	outputFileStem: string;
	sliceToConvert: any;
}

interface File {
	name: string;
	blob?: Blob;
	content?: any;
}

export function toolTip(element: JSX.Element, text: string): JSX.Element {
	return (
		<OverlayTrigger
			placement="bottom"
			overlay={<Tooltip id="">{text}</Tooltip>}
		>
			{element}
		</OverlayTrigger>
	);
}