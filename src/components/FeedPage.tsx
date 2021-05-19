import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton from "../api/ClientSingleton";
import { Feed, FeedFileList } from "@fnndsc/chrisapi";

function FeedPage(): JSX.Element {
	let params = useParams<{ id: any }>();
	const { id } = params;
	const [feed, setFeed] = useState<Feed>(null);
	const [files, setFiles] = useState<FeedFileList>(null);

	async function getFeed(): Promise<void> {
		const client = await ClientSingleton.getInstance();
		const infantfsInstances = await client.getPluginInstances({
			plugin_name: "pl-fshack-infant",
			feed_id: id,
		});
		const instance = infantfsInstances.getItems()[0];
		const feed: Feed = await instance.getFeed();
		setFeed(feed);
	}

	async function getFiles(): Promise<void> {
		if (feed && feed.data) {
			const params = { id: feed.data.id };
			const files = await feed.getFiles(params);
			setFiles(files);
		}
	}

	useEffect(() => {
		getFeed();
	}, []);

	// useEffect(() => {
	// 	getFiles();
	// }, []);

	function getFeedContent(): JSX.Element {
		if (feed && feed.data) {
			return (
				<>
					<h4>id: {feed.data.id}</h4>
					<h4>{}</h4>
					<p>{}</p>
				</>
			);
		}
		return <></>;
	}

	function getFilesContents(): JSX.Element {
		if (files) {
			console.log(files.getItems());
			return <p>foo</p>;
		}
		return <></>;
	}

	return (
		<Container className="py-4">
			<h3>Feed Page</h3>
			{getFeedContent()}
			{/* {getFilesContents()} */}
		</Container>
	);
}

export default FeedPage;
