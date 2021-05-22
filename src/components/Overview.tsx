import { Col } from "react-bootstrap";

function Overview(): JSX.Element {
	return (
		<Col>
			<h2>Background</h2>
			<p>
				While there exists brain analysis tools for adults, the
				development of equivalent tools for infant brains are lagging
				behind. The Infant FreeSurfer plugin, unlike the standard
				FreeSurfer plugin, will allow researchers and clinical workers
				to process and analyze infant brain images to produce
				characteristic information about the brains, such as volume,
				thickness, surface area, and curvature. Developers can also
				choose to generate their own workflow through a shell script
				that would run on a local instance of ChRIS' CUBE.
			</p>
			<h2>Usage</h2>
			<p>
				<ol>
					<li>
						Get the back-end of ChRIS running (further instructions
						<a href="http://chrisproject.org/join-us/get-chris-running">
							{" "}
							here
						</a>
						)
					</li>
					<li>
						If you haven't already, log into the ChRIS back-end
						through our login screen
					</li>
					<li>
						Click the <b> Upload .NII or .DCM dataset </b>
						button to upload a brain image
					</li>
					<li>
						Afterwards, you can view the newly created feed for the
						uploaded file as well as pre-existing feeds associated
						to your CUBE account
					</li>
				</ol>
			</p>
		</Col>
	);
}

export default Overview;
