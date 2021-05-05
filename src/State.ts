import { useState } from "react";
import { createContainer } from "react-tracked";

export interface State {
	username: string;
	showLogin: boolean;
	selectedFile: any;
}

export const initialState: State = {
	username: "",
	showLogin: false,
	selectedFile: null,
};

const useMyState = () => useState<State>(initialState);

export const {
	Provider: SharedStateProvider,
	useTracked: useSharedState,
} = createContainer(useMyState);
