import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";

function FeedPage(): JSX.Element {
	let params = useParams();

	useEffect(() => {
		console.log("params", params);
	}, []);

	return (
		<Container className="py-4">
			<h3>Feed Page</h3>
		</Container>
	);
}

export default FeedPage;
