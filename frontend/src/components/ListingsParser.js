import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import axios from 'axios';
import { motion } from "framer-motion";



const ListingsParser = () => {
    const [listingsData, setListingsData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { state } = useLocation();
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const getListings = async () => {
            try {
                if (state === null) {
                    setError(`(State) Error loading listings`);
                    navigate("/search");
                }
                if (state.listingsData) {
                    setListingsData(state.listingsData);
                } else {
                    const payload = state.payload;
                    const response = await axios.get(`${apiUrl}/getListings`, {
                      params: {
                        type: payload.type,
                        location: payload.location,
                        commute: payload.commute,
                        // ✅ Add new filter parameters
                        "price-min": payload["price-min"],
                        "price-max": payload["price-max"],
                        beds: payload.beds,
                        baths: payload.baths,
                        "size-min": payload["size-min"],
                        "size-max": payload["size-max"]
                      }
                    });

                    const status = response.status;
                    if (status === 200) {
                        setListingsData(response.data);
                    } else {
                        setError(`(${status}) Error loading listings`);
                    }
                }
            } catch (error) {
                setError(`Error contacting server`);
            }
            setLoading(false);
        };
        getListings();
    }, [state, apiUrl, navigate]);

    const handleListingClick = (listing) => {
        const payload = state.payload;
        navigate(`/listing/${listing.listing_id}/${payload.commute}`, {
            state: { listing: listing, commute: payload.commute, listingsData: listingsData },
        });
    };

    const handleBackClick = () => {
        navigate("/search");
    };

    const [hoveredId, setHoveredId] = useState(null);

    if (loading) return <p className="text-center mt-5">Loading property listings...</p>;
    if (error) return <p className="text-danger text-center mt-5">{error}</p>;
    if (!listingsData || !listingsData.listings || listingsData.listings.length === 0) {
        return (
            <Container className="mt-5">
                <Button variant="secondary" className="mb-4" onClick={handleBackClick}>
                    ← Back
                </Button>
                <h1 className="text-center mb-4">Property Listings</h1>
                <h5 className="text-muted text-center">Total Results: 0</h5>
                <p className="text-center mt-5">No properties found.</p>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Button variant="secondary" className="mb-4" onClick={handleBackClick}>
                ← Back
            </Button>
            <h1 className="text-center mb-4">Property Listings</h1>
            <h5 className="text-muted text-center">Total Results: {listingsData.total_results}</h5>
            <Row className="mt-4">
                {listingsData.listings.map((listing) => (
                    <Col key={listing.listing_id} md={4} className="mb-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: hoveredId === null
                                    ? 1
                                    : hoveredId === listing.listing_id
                                        ? 1.05
                                        : 0.95,
                                filter: hoveredId === null
                                    ? "brightness(1)"
                                    : hoveredId === listing.listing_id
                                        ? "brightness(1.05)"
                                        : "brightness(0.8)"
                            }}
                            transition={{ duration: 0.4 }}
                            onMouseEnter={() => setHoveredId(listing.listing_id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <Card className="shadow-xl rounded-3 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                {listing.images && listing.images.length > 0 && (
                                    <Card.Img variant="top" src={listing.images[0]} alt={listing.address} />
                                )}
                                <Card.Body>
                                    <Card.Title className="fs-5">{listing.address}</Card.Title>
                                    <Card.Text>
                                        <strong>Price:</strong> {listing.price ? `€${listing.price.toLocaleString()}` : 'N/A'} <br />
                                        <strong>Bedrooms:</strong> {listing.bedrooms ?? 'N/A'} | <strong>Bathrooms:</strong> {listing.bathrooms ?? 'N/A'} <br />
                                        <strong>Size:</strong> {listing.size ? `${listing.size} sq ft` : 'N/A'} <br />
                                        🚗 {listing.commute_times?.car} min | 🚶 {listing.commute_times?.walk} min
                                    </Card.Text>
                                    <Button variant="primary" onClick={() => handleListingClick(listing)}>
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

export default ListingsParser;