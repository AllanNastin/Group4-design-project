import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "axios";

const RecommendedListings = () => {
    const [recommended, setRecommended] = useState([]);
    const [hoveredId, setHoveredId] = useState(null);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendations = async () => {
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
            }
        };

        fetchRecommendations();
    }, [apiUrl]);

    const handleClick = (listing) => {
        navigate(`/listing/${listing.listing_id}/recommended`, {
            state: {
                listing,
                from: "/search", // mark down resource from search
            },
        });

    };

    if (error) {
        return <p className="text-center text-danger mt-5">{error}</p>;
    }

    if (recommended.length === 0) return null;

    return (
        <Container className="mt-5">
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
                                        {listing.size ? `${listing.size} sq ft` : "N/A"}
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
        </Container>
    );
};

export default RecommendedListings;
