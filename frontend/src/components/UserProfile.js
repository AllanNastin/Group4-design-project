import React, { useState, useEffect, useRef } from "react";
import { decodeJWT } from "../Utils/UserManagement";
// decode JWT token
localStorage.getItem("google_token")

const UserProfile = () => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const token = localStorage.getItem("google_token");
    const user = decodeJWT(token);
    const handleLogout = () => {
        localStorage.removeItem("google_token");
        window.location.href = "/login";
    };

    const handleFavourites = () => {
        window.location.href = "/saved-listings";
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div ref={dropdownRef} style={{ position: "absolute", top: 10, right: 10 }}>
            <div
                onClick={() => setOpen(!open)}
                style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
                <img
                    src={user.picture}
                    alt={user.name}
                    style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 8 }}
                />
                <span>{user.name}</span>
            </div>

            {open && (
                <div style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 10px)",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 1000,
                    width: 160
                }}>
                    <button
                        onClick={handleFavourites}
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "10px 16px",
                            textAlign: "left",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: 14
                        }}
                    >
                        Favorites
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "10px 16px",
                            textAlign: "left",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: 14
                        }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
