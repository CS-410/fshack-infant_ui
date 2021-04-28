import Info from './Info';
import Navigation from './Navigation';
import UploadButton from './UploadButton';
import Background from './Assets/cubes.png';

function Home(): JSX.Element {
	return (
		<div style={{ backgroundImage: `url(${Background})` }}>
			<div className="home">
				<Navigation />
				<Info />
				<UploadButton />
			</div>
		</div>
	);
}

export default Home;
