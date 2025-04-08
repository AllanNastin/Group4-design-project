import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const SavedListings = () => {
  const [savedListings, setSavedListings] = useState([]);
  const navigate = useNavigate();

    const location = useLocation();
    const isFromRecommended = location.pathname.includes("recommended");


    useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("savedListings")) || [];
    setSavedListings(saved);
  }, []);

  if (savedListings.length === 0) {
    return (
      <Container className="mt-5">
        <h1 className="text-center">No Saved Listings</h1>
        <Button variant="primary" onClick={() => navigate("/listings")}>
          Back to Listings
        </Button>
      </Container>
    );
  }

  const handleListingClick = (listing) => {
    navigate(`/listing/${listing.listing_id}/${listing.commute}`, { state: { listing: listing, commute: listing.commute } });
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Saved Listings</h1>
      <Row className="mt-4">
        {savedListings.map((listing) => (
          <Col key={listing.listing_id} md={4} className="mb-4">
            <Card className="shadow-lg">
              {listing.images && listing.images.length > 0 && (
                <Card.Img variant="top" src={listing.images[0]} alt={listing.address} />
              )}
              <Card.Body>
                <Card.Title className="fs-5">{listing.address}</Card.Title>
                <Card.Text>
                    <strong>Price:</strong> {listing.price === -1 ? " Unavailable " : `€${listing.price.toLocaleString()} `} <br />
                    <strong>Bedrooms:</strong> {listing.bedrooms !== null ? listing.bedrooms : 'N/A'} | <strong>Bathrooms:</strong> {listing.bathrooms !== null ? listing.bathrooms : 'N/A'} <br />
                  <strong>Size:</strong> {listing.size !== null ? `${listing.size} sq ft` : 'N/A'} <br />
                    {!isFromRecommended &&
                        listing.commute_times &&
                        listing.commute_times.car !== "None" &&
                        listing.commute_times.walk !== "None" && (
                            <>
                  🚗 {listing.commute_times?.car} min | 🚶 {listing.commute_times?.walk} min | 🚲 {listing.commute_times?.cycling} min | 🚌 {listing.commute_times?.public} min
                            </>
                        )}
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

export default SavedListings;
