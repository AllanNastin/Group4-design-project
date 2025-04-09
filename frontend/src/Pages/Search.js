import React from "react";
import SearchForm from "../components/SearchForm";
import "../App.css";
import RecommendedListings from "../components/RecommendedListings";

const Search = () => {
    return (
        <div style={{ padding: "2rem" }}>

            {/* search box UI */}
            <div style={{
                backgroundColor: "#fff", borderRadius: "20px", boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                padding: "2rem", width: "80%", margin: "0 auto", animation: "fadeIn 1s ease"
            }}>
                <SearchForm />
            </div>
            <div className="mt-10">
                <RecommendedListings />
            </div>
        </div>
    );
};

export default Search;
