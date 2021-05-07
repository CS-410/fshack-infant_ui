import { UploadedFile } from "@fnndsc/chrisapi";
import { useState } from "react";
import { createContainer } from "react-tracked";

export interface State {
	username: string;
	showLogin: boolean;
	showWorkflow: boolean;
	selectedFile: File;
	uploadedFile: UploadedFile;
}

export const initialState: State = {
	username: "",
	showLogin: false,
	showWorkflow: false,
	selectedFile: null,
	uploadedFile: null,
};

const useMyState = () => useState<State>(initialState);

export const {
	Provider: SharedStateProvider,
	useTracked: useSharedState,
} = createContainer(useMyState);
