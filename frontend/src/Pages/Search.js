import React from "react";
import SearchForm from "../components/SearchForm";
import UserProfile from "../components/UserProfile";
import "../App.css";

const Search = () => {
    return (
        <div style={{ padding: "2rem" }}>
            {/* top box UI */}
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "1rem 2rem", backgroundColor: "#f8f9fa", borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "2rem",
                animation: "slideDown 0.6s ease-out"
            }}>
                <div style={{ fontWeight: "bold", fontSize: "1.4rem", color: "#3c3c3c", display: "flex", alignItems: "center" }}>
                    <img src="/logo192.png" alt="Logo" style={{ width: 36, height: 36, marginRight: 10 }} />
                    House Scraper
                </div>
                <UserProfile />
            </div>

            {/* search box UI */}
            <div style={{
                backgroundColor: "#fff", borderRadius: "20px", boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                padding: "2rem", width: "80%", margin: "0 auto", animation: "fadeIn 1s ease"
            }}>
                <SearchForm />
            </div>
        </div>
    );
};

export default Search;
