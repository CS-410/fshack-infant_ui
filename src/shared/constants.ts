import { FeedViewState } from "./interfaces";

export const dircopyPluginName = "pl-dircopy";
export const med2ImgPluginName = "pl-med2img";
export const infantFSPluginName = "pl-fshack-infant";

export const feedPageParameter = "feedId";

export const initialFeedViewState: FeedViewState = {
	ifsFiles: [],
	medFiles: [],
	uploadedFileName: "",
	feed: null,
	feedStatus: -1,
};
