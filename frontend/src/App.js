import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import IndividualListings from "./Pages/IndividualListings";
import Listings from "./Pages/Listings";
import Search from "./Pages/Search";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/search" element={<Search/>} />
        <Route path="/listings" element={<Listings/>} />
        <Route path="/listing/:id/:commute" element={<IndividualListings />} />

        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

