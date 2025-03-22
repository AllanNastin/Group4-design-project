import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // check SDK
        if (!window.google || !window.google.accounts) {
            console.error("API loading error");
            return;
        }


        window.handleCredentialResponse = (response) => {
            console.log("Google JWT Token:", response.credential);
            localStorage.setItem("google_token", response.credential);
            navigate("/search"); // go search page
        };

        // initialize google Login
        window.google.accounts.id.initialize({
            client_id: "88616505497-vogc6j8lm62mtpq6upi5r97eq9u4g5uk.apps.googleusercontent.com",
            callback: window.handleCredentialResponse,
        });

        // initialize login button
        const btnDiv = document.getElementById("google-login-button");
        if (btnDiv) {
            window.google.accounts.id.renderButton(btnDiv, {
                theme: "outline",
                size: "large",
            });
        }

        window.google.accounts.id.prompt();
    }, [navigate]);

    return (
        <div className="text-center mt-5">
            <h2>Please use Google login</h2>
            <div id="google-login-button" className="d-flex justify-content-center mt-4"></div>
        </div>
    );
};

export default LoginPage;
