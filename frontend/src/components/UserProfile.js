// src/Pages/UserProfile.js
import React from "react";

// decode JWT token
function decodeJWT(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = decodeURIComponent(
            atob(base64Url).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(base64);
    } catch (e) {
        console.error("Token decode error", e);
        return null;
    }
}

const UserProfile = () => {
    const token = localStorage.getItem("google_token");
    const user = decodeJWT(token);

    const handleLogout = () => {
        localStorage.removeItem("google_token");
        window.location.href = "/login";
    };

    if (!user) return null;

    return (
        <div style={{ display: "flex", alignItems: "center", position: "absolute", top: 10, right: 10 }}>
            <img
                src={user.picture}
                alt={user.name}
                style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
            />
            <span style={{ marginRight: 10 }}>{user.name}</span>
            <button onClick={handleLogout}>Log out</button>
        </div>
    );
};

export default UserProfile;