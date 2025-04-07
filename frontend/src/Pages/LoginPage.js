import React from "react";
import { Container, Card } from "react-bootstrap";

const LoginPage = () => {
    return (
        <div style={styles.pageWrapper}>
            <div style={styles.overlay} />
            <Container style={styles.container}>
                <Card style={styles.card}>
                    <Card.Body className="text-center">
                        <h1 className="mb-4">Welcome</h1>
                        <p className="mb-4">
                            Log in with Google to explore smart housing listings tailored to you.
                        </p>
                        <div id="g_id_onload"
                             data-client_id="YOUR_CLIENT_ID"
                             data-context="signin"
                             data-ux_mode="popup"
                             data-callback="handleCredentialResponse"
                             data-auto_prompt="false"
                        ></div>

                        <div className="g_id_signin"
                             data-type="standard"
                             data-shape="rectangular"
                             data-theme="outline"
                             data-text="sign_in_with"
                             data-size="large"
                             data-logo_alignment="left"
                        ></div>

                        <p className="mt-4 text-muted">
                            Powered by House Scraper • Group 4 — 2025
                        </p>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

const styles = {
    pageWrapper: {
        backgroundImage: `url('/images.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1,
    },
    container: {
        position: "relative",
        zIndex: 2,
    },
    card: {
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        maxWidth: "500px",
        margin: "auto",
    }
};

export default LoginPage;
