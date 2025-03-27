import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SavedListings = () => {
  const [savedListings, setSavedListings] = useState([]);
  const navigate = useNavigate();

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

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Saved Listings</h1>
      <Row>
        {savedListings.map((listing) => {
          const data = {
            labels: listing.price_dates,
            datasets: [
              {
                label: 'Price History',
                data: listing.price_history,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
              },
            ],
          };

          return (
            <Col key={listing.listing_id} md={4} className="mb-4">
              <Card className="shadow-lg">
                {listing.images && listing.images.length > 0 && (
                  <Card.Img variant="top" src={listing.images[0]} alt={listing.address} />
                )}
                <Card.Body>
                  <Card.Title className="text-center fs-5 fw-bold">{listing.address}</Card.Title>
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
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/listing/${listing.listing_id}/${listing.commute}`, { state: { listing: listing, commute: listing.commute } })}
                    >
                      View Listing
                    </Button>
                  </div>

                  <hr />
                  <h5 className="fw-bold text-center">Price History</h5>
                  <Line data={data} />
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default SavedListings;