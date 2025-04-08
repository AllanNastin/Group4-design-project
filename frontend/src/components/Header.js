import { useNavigate } from "react-router-dom";
import UserProfile from "../components/UserProfile";

const Header = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "1rem", margin: "1rem", backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
            {/* top box UI */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center", // Ensures vertical centering
                padding: "1rem 2rem",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                animation: "slideDown 0.6s ease-out"
            }}>
                <div
                    onClick={() => navigate("/search")}
                    style={{
                        fontWeight: "bold",
                        fontSize: "1.4rem",
                        color: "#3c3c3c",
                        display: "flex",
                        alignItems: "center", // Ensures vertical centering for logo and text
                        cursor: "pointer" // Makes it look clickable
                    }}
                >
                    <img src="/logo192.png" alt="Logo" style={{ width: 36, height: 36, marginRight: 10 }} />
                    House Scraper
                </div>
                <div style={{ display: "flex", alignItems: "center" }}> {/* Ensures UserProfile is vertically centered */}
                    <UserProfile />
                </div>
            </div>
        </div>
    );
};

export default Header;