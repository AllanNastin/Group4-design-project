import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import IndividualListings from "./Pages/IndividualListings";
import Listings from "./Pages/Listings";
import Search from "./Pages/Search";
import LoginPage from "./Pages/LoginPage";
import SavedListings from "./Pages/SavedListings";
import Header from "./components/Header";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("google_token");
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<RequireAuth><Search /></RequireAuth>} />
        <Route path="/listings" element={<RequireAuth><Listings /></RequireAuth>} />
        <Route path="/listing/:id/:carParam/:walkParam/:cyclingParam/:publicTransportParam/:commute"
          element={<RequireAuth><IndividualListings /></RequireAuth>}
        />
        <Route path="/saved-listings" element={<SavedListings />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;

