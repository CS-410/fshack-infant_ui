import Info from './Info';
import Navigation from './Navigation';
import UploadButton from './UploadButton';
import Footer from './Footer';
import '../index.css'

import Client from '@fnndsc/chrisapi';

function Home(): JSX.Element {
	return (
		<div className="page-container">
		<div className="content-wrap">

			<div >
				<div className="Home">
					<Navigation />
					<Info />
					<UploadButton />	
				</div>
			</div>

		</div>

		<Footer />
		</div>
	);
}

export default Home;

/*style={{ backgroundImage: `url(${Background})` }}*/ 