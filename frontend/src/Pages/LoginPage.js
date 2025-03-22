import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LoginPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!window.google || !window.google.accounts) {
            console.error("API loading error");
            return;
        }

        window.handleCredentialResponse = (response) => {
            console.log("Google JWT Token:", response.credential);
            localStorage.setItem("google_token", response.credential);
            navigate("/search");
        };

        window.google.accounts.id.initialize({
            client_id: "88616505497-vogc6j8lm62mtpq6upi5r97eq9u4g5uk.apps.googleusercontent.com",
            callback: window.handleCredentialResponse,
        });

        const btnDiv = document.getElementById("google-login-button");
        if (btnDiv) {
            window.google.accounts.id.renderButton(btnDiv, {
                theme: "outline",
                size: "large",
                width: 300
            });
        }

        window.google.accounts.id.prompt();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-blue-100">
            <div className="bg-white shadow-2xl rounded-2xl p-10 flex flex-col items-center max-w-md w-full mx-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl font-extrabold text-blue-700 mb-4 tracking-wide"
                >
                    House Scraper
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-base text-gray-600 mb-6 text-center"
                >
                    Start your smart property journey by logging in with Google
                </motion.p>

                <div id="google-login-button" className="mb-4"></div>

                <p className="text-xs text-gray-400 mt-4">© 2025 House Scraper Team Group4. All rights reserved.</p>
            </div>
        </div>
    );
};

export default LoginPage;