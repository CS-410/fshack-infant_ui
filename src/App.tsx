import React from 'react';
import logobch from '../src/logobch.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logobch} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="http://chrisproject.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </header>
    </div>
  );
}

export default App;