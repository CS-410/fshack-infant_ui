import { IPluginCreateData, Feed } from "@fnndsc/chrisapi";

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

export interface FileObj {
	path: string;
	name: string;
	ext: string;
	blob?: Blob;
	content?: any;
}

export interface SearchParams {
	plugin_name?: string;
	limit?: number;
	offset?: number;
}

export interface Parameters {
	[key: string]: string;
}

export type FeedViewState = {
	ifsFiles: FileObj[];
	medFiles: FileObj[];
	uploadedFileName: string;
	feed: Feed;
	feedStatus: number;
};

export type FeedViewValue =
	| FileObj[]
	| string
	| Feed
	| number
	| { feed: Feed; feedStatus: number };

export type FeedViewDispatch = React.Dispatch<{
	type: string;
	value: FeedViewValue;
}>;

export type TableStructure = { head: TableHeader; body: TableBody };
export type TableHeader = { [key: string]: string | undefined }[];
export type TableBody = string[][];
