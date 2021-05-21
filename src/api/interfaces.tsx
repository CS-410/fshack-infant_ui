import { IPluginCreateData } from "@fnndsc/chrisapi";

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

export interface File {
	name: string;
	path: string;
	ext: string;
	blob?: Blob;
	content?: any;
}