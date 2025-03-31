import React, { useEffect } from "react";

const LoginPage = () => {
    useEffect(() => {
        /* global google */
        if (window.google) {
            google.accounts.id.initialize({
                client_id: "YOUR_CLIENT_ID_HERE",
                callback: handleCredentialResponse,
            });

            google.accounts.id.renderButton(
                document.getElementById("googleSignIn"),
                {
                    theme: "outline",
                    size: "large",
                    shape: "pill",
                    width: "100%",
                }
            );
        }
    }, []);

    const handleCredentialResponse = (response) => {
        console.log("Google login token:", response.credential);
        // Send token to backend or handle auth here
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Welcome to House Scraper</h1>
                <p style={styles.subtitle}>
                    Sign in with Google to explore smart housing listings tailored just for you.
                </p>
                <div id="googleSignIn" style={{ marginTop: "1.5rem" }} />
                <p style={styles.footer}>Powered by Group 4 — 2025</p>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #e6f0ff, #ffffff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
    },
    card: {
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        padding: "2.5rem 3rem",
        maxWidth: "500px",
        textAlign: "center",
    },
    title: {
        fontSize: "2rem",
        marginBottom: "0.5rem",
        fontWeight: "600",
    },
    subtitle: {
        fontSize: "1rem",
        color: "#555",
    },
    footer: {
        fontSize: "0.85rem",
        marginTop: "2rem",
        color: "#999",
    },
};

export default LoginPage;
