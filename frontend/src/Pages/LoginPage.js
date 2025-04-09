import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, Row, Col, Card} from "react-bootstrap";
import logo from "../../src/logo.svg";

const LoginPage = () => {
    const navigate = useNavigate();

    const [hoveredId, setHoveredId] = useState(null);

    useEffect(() => {
        if (!window.google || !window.google.accounts) {
            console.error("API loading error");
            return;
        }

        window.handleCredentialResponse = (response) => {
            localStorage.setItem("google_token", response.credential);
            navigate("/search");
        };

        window.google.accounts.id.initialize({
            client_id: "88616505497-vogc6j8lm62mtpq6upi5r97eq9u4g5uk.apps.googleusercontent.com",
            callback: window.handleCredentialResponse,
        });

        const btnDiv = document.getElementById("google-login-button");
        if (btnDiv) {
            btnDiv.innerHTML = "";
            window.google.accounts.id.renderButton(btnDiv, {
                theme: "outline",
                size: "large",
                width: 300
            });
        }

        window.google.accounts.id.prompt();
    }, [navigate]);

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col key={1} md="auto" className="mb-4">
                    <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                    opacity: 1,
                    y: 0,
                    scale: hoveredId === null
                    ? 1
                    : hoveredId === 1
                    ? 1.05
                    : 0.95,
                    filter: hoveredId === null
                    ? "brightness(1)"
                    : hoveredId === 1
                    ? "brightness(1.05)"
                    : "brightness(0.8)"
                    }}
                    transition={{ duration: 0.4 }}
                    onMouseEnter={() => setHoveredId(1)}
                    onMouseLeave={() => setHoveredId(null)}
                    >
                        <Card className="shadow-lg">
                            <Card.Img variant="top" src={logo} />
                            <Card.Body>
                                <Card.Title className="text-center">HomeRoute</Card.Title>
                                <Card.Text className="text-muted text-center">Smart Property Finder</Card.Text>
                                <div id="google-login-button" className="d-flex justify-content-center mb-4"></div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;