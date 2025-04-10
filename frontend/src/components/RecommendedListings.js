import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const RecommendedListings = () => {
    const [recommended, setRecommended] = useState([]);
    const [hoveredId, setHoveredId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${apiUrl}/getListings`, {
                    params: {
                        type: "sale",
                        location: "D04",
                        commute: "Trinity"
                    }
                });

                if (response.status === 200 && response.data.listings) {
                    const shuffled = [...response.data.listings].sort(() => 0.5 - Math.random());
                    setRecommended(shuffled.slice(0, 9));
                } else {
                    setError("No recommended listings found");
                }
            } catch (err) {
                setError("Error loading recommended listings");
                setRecommended([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [apiUrl]);

    const handleClick = (listing) => {
        const listing_state = { ...listing, current_price: listing.price }
        navigate(`/listing/${listing.listing_id}/non/non/non/non/recommended`, {
            state: {
                listing: listing_state,
                from: "/search", // mark down resource from search
            },
        });
    };

    return (
        <Container className="mt-5">
            <AnimatePresence mode="wait"> {/* mode="wait" ensures exit animation finishes before enter */}
                {loading ? (
                    // Loading State
                    <motion.div
                        key="loading" // Unique key for AnimatePresence
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center mt-5 d-flex flex-column align-items-center" // Center content
                    >
                        <div style={{ animation: "slideDown 0.6s ease-out" }}>
                            <Spinner animation="border" role="status" className="mb-3">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <h2>Loading Recommended Properties...</h2>
                        </div>
                    </motion.div>
                ) : error ? (
                    // Error State
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center text-danger mt-5"
                    >
                        <h2>Error</h2>
                        <p>{error}</p>
                        {/* Optional: Add a retry button */}
                    </motion.div>
                ) : recommended.length === 0 ? (
                    // No Results State
                    <motion.div
                        key="no-results"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center text-muted mt-5"
                    >
                        <h2>No Recommendations Found</h2>
                    </motion.div>
                ) : (
                    // Success State - Animate the whole section
                    <motion.div
                        key="results" // Unique key
                        initial="hidden"
                        animate="visible"
                        exit="exit" // Define exit animation if needed elsewhere
                    >
                        <h2 className="text-center mb-4">Recommended Properties</h2>
                        <Row>
                            {recommended.map((listing) => (
                                <Col key={listing.listing_id} md={4} className="mb-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale:
                                                hoveredId === null
                                                    ? 1
                                                    : hoveredId === listing.listing_id
                                                        ? 1.05
                                                        : 0.95,
                                            filter:
                                                hoveredId === null
                                                    ? "brightness(1)"
                                                    : hoveredId === listing.listing_id
                                                        ? "brightness(1.05)"
                                                        : "brightness(0.8)",
                                        }}
                                        transition={{ duration: 0.4 }}
                                        onMouseEnter={() => setHoveredId(listing.listing_id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        <Card className="shadow-lg rounded-3 overflow-hidden">
                                            {listing.images?.[0] && (
                                                <Card.Img
                                                    variant="top"
                                                    src={listing.images[0]}
                                                    alt={listing.address}
                                                    style={{ height: "220px", objectFit: "cover" }}
                                                />
                                            )}
                                            <Card.Body>
                                                <Card.Title className="fs-5">{listing.address}</Card.Title>
                                                <Card.Text>
                                                    <strong>Price:</strong>{" "}
                                                    {listing.price ? `€${listing.price.toLocaleString()}` : "N/A"}
                                                    <br />
                                                    <strong>Bedrooms:</strong> {listing.bedrooms ?? "N/A"} |{" "}
                                                    <strong>Bathrooms:</strong> {listing.bathrooms ?? "N/A"}
                                                    <br />
                                                    <strong>Size:</strong>{" "}
                                                    {listing.size ? `${listing.size} m²` : "N/A"}
                                                    <br />
                                                </Card.Text>

                                                <Button variant="primary" onClick={() => handleClick(listing)}>
                                                    View Details
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    </motion.div>
                )}
            </AnimatePresence>
        </Container>
    );
};

export default RecommendedListings;
