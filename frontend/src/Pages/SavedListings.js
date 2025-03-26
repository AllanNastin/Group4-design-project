import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SavedListings = () => {
  const [savedListings, setSavedListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve saved listings from sessionStorage
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

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Saved Listings</h1>
      <Row>
        {savedListings.map((listing) => (
          <Col key={listing.id} md={4} className="mb-4">
            <Card className="shadow-lg">
              <Card.Body>
                <Card.Title>Listing ID: {listing.id}</Card.Title>
                <Card.Text>Commute: {listing.commute}</Card.Text>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/listing/${listing.id}/${listing.commute}`)}
                >
                  View Listing
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