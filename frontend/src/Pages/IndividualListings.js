import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const IndividualListings = () => {

  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { state } = useLocation();

  useEffect(() => {
    if(state === null) {
      setError(`(State) Error loading listings`);
      navigate("/search");
    }
    else {
      setListing(state.listing);
      setLoading(false);
    }
  }, [state, navigate]);

  if (loading) return <p className="text-center mt-5">Loading listing details...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;
  if (!listing) return <p className="text-center mt-5">No listing found.</p>;

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg">
            {listing.images && listing.images.length > 0 && (
              <Card.Img variant="top" src={listing.images[0]} alt={listing.address} />
            )}
            <Card.Body>
              <Card.Title className="text-center fs-3 fw-bold">{listing.address}</Card.Title>
              <h5 className="text-muted text-center">{listing.eircode}</h5>
              <hr />

              <Row>
                <Col md={6}>
                  <h4 className="fw-bold text-primary">€{listing.price.toLocaleString()}</h4>
                  <ListGroup variant="flush" className="mb-3">
                    <ListGroup.Item><strong>Bedrooms:</strong> {listing.bedrooms}</ListGroup.Item>
                    <ListGroup.Item><strong>Bathrooms:</strong> {listing.bathrooms}</ListGroup.Item>
                    <ListGroup.Item><strong>Size:</strong> {listing.size} sq ft</ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <h5 className="fw-bold">Commute Times:</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item>🚗 By Car: {listing.commute_times?.car} min</ListGroup.Item>
                    <ListGroup.Item>🚶‍ By Walk: {listing.commute_times?.walk} min</ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>

              <hr />
              <p className="lead">{listing.description || "No description available."}</p>

              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate("/listings", { state: { listingsData: state.listingsData } })}>Back to Listings</Button>
                <Button variant="success">Contact Landlord</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default IndividualListings;
