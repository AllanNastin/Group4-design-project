import React from "react";
import SearchForm from "../components/SearchForm";
import UserProfile from "../components/UserProfile";
const Search = () => {
  return (
      <div style={{ position: "relative", padding: "1rem" }}>
        <UserProfile />
        <SearchForm />
      </div>
  );
};
export default Search;