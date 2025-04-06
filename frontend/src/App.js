import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import IndividualListings from "./Pages/IndividualListings";
import Listings from "./Pages/Listings";
import Search from "./Pages/Search";
import LoginPage from "./Pages/LoginPage";
import SavedListings from "./Pages/SavedListings";

const RequireAuth = ({ children }) => {
    const token = localStorage.getItem("google_token");
    return token ? children : <Navigate to="/login" />;
};
function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/search" element={<RequireAuth><Search/></RequireAuth>} />
          <Route path="/listings" element={<RequireAuth><Listings/></RequireAuth>} />
          <Route path="/listing/:id/:car/:walk/:cycling/:publicTransport/:commute" element={<RequireAuth><IndividualListings /></RequireAuth>} />
          <Route path="/saved-listings" element={<SavedListings />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

