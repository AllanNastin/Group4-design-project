import React, { useState } from "react";
import yaml from "js-yaml";
import logo from './logo.svg';
import './App.css';

function App() {
  const [yamlInput, setYamlInput] = useState("");
  const [jsonObject, setJsonObject] = useState(null);
  const [error, setError] = useState(null);

  const handleYamlChange = (event) => {
    setYamlInput(event.target.value);
  };

  const parseYaml = () => {
    try {
      const parsedObject = yaml.load(yamlInput);
      setJsonObject(parsedObject);
      setError(null);
    } catch (err) {
      setError("YAML wrong, please check the format！");
      setJsonObject(null);
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        {/* add yaml convert func */}
        <h1>YAML Input Convert </h1>
        <textarea
            rows="10"
            cols="50"
            placeholder="please input ymal"
            value={yamlInput}
            onChange={handleYamlChange}
        />
        <br />
        <button onClick={parseYaml}>CONVERT</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {jsonObject && (
            <div>
              <h2>convert result：</h2>
              <pre>{JSON.stringify(jsonObject, null, 2)}</pre>
            </div>
        )}
      </header>
    </div>
  );
}

export default App;
