import { Container, Row, Table } from "react-bootstrap";
import dataSample from "../dataSample";

function renderData(
	data: {
		Index: string;
		SegId: string;
		NVoxels: string;
		Volume_mm3: string;
		StructName: string;
		normMean: string;
		normStdDev: string;
		normMin: string;
		normMax: string;
		normRange: string;
	},
	index: number
) {
	return (
		<tr key={index}>
			<td>{data.Index}</td>
			<td>{data.SegId}</td>
			<td>{data.NVoxels}</td>
			<td>{data.Volume_mm3}</td>
			<td>{data.StructName}</td>
			<td>{data.normMean}</td>
			<td>{data.normStdDev}</td>
			<td>{data.normMin}</td>
			<td>{data.normMax}</td>
			<td>{data.normRange}</td>
		</tr>
	);
}

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
							<th>Index</th>
							<th>SegID</th>
							<th>NVoxels</th>
							<th>Volume_mm3</th>
							<th>StructName</th>
							<th>normMean</th>
							<th>normStdDev</th>
							<th>normMin</th>
							<th>normMax</th>
							<th>normRange</th>
						</tr>
					</thead>
					<tbody>{dataSample.map(renderData)}</tbody>
				</Table>
			</Row>
		</Container>
	);
}

export default Results;
