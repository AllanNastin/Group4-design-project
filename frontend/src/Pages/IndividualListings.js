import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";

const IndividualListingPage = () => {
  const { id } = useParams(); // Get the listing ID from the URL
  const navigate = useNavigate();

  // Placeholder listing details (replace with real data later)
  const listing = {
    id,
    title: "Modern Apartment in City Center",
    price: "€1,500 / month",
    description: "A beautiful modern apartment with great city views.",
    location: "Dublin, Ireland",
    image: "https://via.placeholder.com/600", // Placeholder image
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8}>
          <Card>
            <Card.Img variant="top" src={listing.image} />
            <Card.Body>
              <Card.Title>{listing.title}</Card.Title>
              <Card.Text>
                <strong>Price:</strong> {listing.price} <br />
                <strong>Location:</strong> {listing.location} <br />
                {listing.description}
              </Card.Text>
              <Button variant="primary" onClick={() => navigate(-1)}>Back to Listings</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default IndividualListingPage;
