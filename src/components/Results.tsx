import { Container, Row, Table } from "react-bootstrap";

function Results(): JSX.Element {
	return (
		<Container className="py-3">
			<Row>
				<h1>Results page</h1>
			</Row>
			<Row>
				<Table hover>
					<thead>
						<tr>
							<th>Study</th>
							<th>Study Date</th>
							<th>Patient MRN</th>
							<th>Patient DOB</th>
							<th>Analysis Created</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Data</td>
							<td>Data</td>
							<td>Data</td>
							<td>Data</td>
							<td>Data</td>
						</tr>
					</tbody>
				</Table>
			</Row>
		</Container>
	);
}

export default Results;
