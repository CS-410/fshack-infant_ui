import { useState } from "react";
import { createContainer } from "react-tracked";

const initialState = {
	username: "",
	showLogin: false,
    selectedFile: null
};

const useMyState = () => useState(initialState);

export const {
	Provider: SharedStateProvider,
	useTracked: useSharedState,
} = createContainer(useMyState);
