import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import IndividualListings from "./Pages/IndividualListings";
import ListingsParser from "./components/ListingsParser";

// for now we use v6 instead of v7
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ListingsParser />} />
        <Route path="/listing/:id" element={<IndividualListings />} />
      </Routes>
    </Router>
  );
}

export default App;
