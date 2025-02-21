import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import axios from 'axios';

const ListingsParser = () => {
    const [listingsData, setListingsData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch listings data from JSON file
    useEffect(() => {
        /*
        fetch("/Sample.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((jsonData) => {
                setListingsData(jsonData);
            })
            .catch((err) => {
                setError(`Error loading JSON: ${err.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
        */
        getListings();
    }, []);

    const handleListingClick = (listing) => {
        navigate("/listing/" + listing.listing_id);
    };

    // Make get request to backend
    const getListings = async () => {
        const response = await axios.get('https://gdp4back.sprinty.tech/getListings', {
            // add request params
        });
        const status = response.status;
        // if OK response
		if(status === 200) {
            setListingsData(response.data);
        }
        else {
            setError(`(${status}) Error loading listings`)
        }
        setLoading(false);

    };

    if (loading) return <p className="text-center mt-5">Loading property listings...</p>;
    if (error) return <p className="text-danger text-center mt-5">{error}</p>;
    if (!listingsData || !listingsData.listings || listingsData.listings.length === 0)
        return <p className="text-center mt-5">No properties found.</p>;

    return (
        <Container className="mt-5">
            {/* Back Button */}
            <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>
                ← Back
            </Button>

            <h1 className="text-center mb-4">Property Listings</h1>
            <h5 className="text-muted text-center">Total Results: {listingsData.total_results}</h5>
            <Row className="mt-4">
                {listingsData.listings.map((listing) => (
                    <Col key={listing.listing_id} md={4} className="mb-4">
                        <Card className="shadow-lg">
                            {listing.images && listing.images.length > 0 && (
                                <Card.Img variant="top" src={listing.images[0]} alt={listing.address} />
                            )}
                            <Card.Body>
                                <Card.Title className="fs-5">{listing.address}</Card.Title>
                                <Card.Text>
                                    <strong>Price:</strong> €{listing.price.toLocaleString()} <br />
                                    <strong>Bedrooms:</strong> {listing.bedrooms} | <strong>Bathrooms:</strong> {listing.bathrooms} <br />
                                    <strong>Size:</strong> {listing.size} sq ft <br />
                                    🚗 {listing.commute_times?.car} min | 🚶 {listing.commute_times?.walk} min
                                </Card.Text>
                                <Button variant="primary" onClick={() => handleListingClick(listing)}>
                                    View Details
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default ListingsParser;
