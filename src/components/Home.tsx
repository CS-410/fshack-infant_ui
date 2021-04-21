import Info from "./Info";
import Navigation from "./Navigation";
import UploadButton from "./UploadButton";

function Home(): JSX.Element {
  return (
    <div className="home">
      <p>This is the Home component.</p>
      <Navigation />
      <Info />
      <UploadButton />
    </div>
  );
}

export default Home;
