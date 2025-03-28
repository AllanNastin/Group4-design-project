import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { FaHeart, FaRegHeart } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const IndividualListings = () => {
  const { id, commute } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { state } = useLocation();

  useEffect(() => {
    if (!id) {
      setError(`Listing ID is missing in the URL.`);
      setLoading(false);
      return;
    }

    if (state && state.listing) {
      const listingData = state.listing;

      if (!listingData.price_history || !listingData.price_dates) {
        const mockPriceHistory = [listingData.price];
        const mockPriceDates = [new Date().toISOString().split('T')[0]];
        const basePrice = listingData.price;
        const currentDate = new Date();

        for (let i = 1; i < 10; i++) {
          mockPriceHistory.push(basePrice + (Math.random() * 2000 - 1000));
          const date = new Date(currentDate);
          date.setMonth(currentDate.getMonth() - i);
          mockPriceDates.push(date.toISOString().split('T')[0]);
        }

        listingData.price_history = mockPriceHistory.reverse();
        listingData.price_dates = mockPriceDates.reverse();
      }

      setListing(listingData);
      setLoading(false);

      let savedListings = JSON.parse(sessionStorage.getItem("savedListings")) || [];
      savedListings = savedListings.filter(savedItem => savedItem !== null && savedItem !== undefined);
      sessionStorage.setItem("savedListings", JSON.stringify(savedListings));
      setIsSaved(savedListings.some(savedItem => savedItem.listing_id === parseInt(id)));
    } else {
      setError(`Listing data is not available.`);
      setLoading(false);
    }
  }, [id, commute, state, navigate]);

  useEffect(() => {
    if (listing) {
      const savedListings = JSON.parse(sessionStorage.getItem("savedListings")) || [];
      const isListingSaved = savedListings.some(savedItem => savedItem.listing_id === parseInt(id));
      setIsSaved(isListingSaved);
    }
  }, [listing, id]);

  const saveListingData = (listingToSave) => {
    return {
      listing_id: listingToSave.listing_id,
      address: listingToSave.address,
      eircode: listingToSave.eircode,
      price: listingToSave.price,
      bedrooms: listingToSave.bedrooms,
      bathrooms: listingToSave.bathrooms,
      size: listingToSave.size,
      commute_times: listingToSave.commute_times,
      description: listingToSave.description,
      images: listingToSave.images,
      price_dates: listingToSave.price_dates,
      price_history: listingToSave.price_history,
      commute: commute, // Include commute from URL
    };
  };

  const handleSaveListing = () => {
    let savedListings = JSON.parse(sessionStorage.getItem("savedListings")) || [];
    savedListings = savedListings.filter(savedItem => savedItem !== null && savedItem !== undefined);

    if (isSaved) {
      const updatedListings = savedListings.filter(savedItem => savedItem.listing_id !== parseInt(id));
      sessionStorage.setItem("savedListings", JSON.stringify(updatedListings));
      setIsSaved(false);
    } else {
      const alreadySaved = savedListings.some(savedItem => savedItem.listing_id === parseInt(id));
      if (!alreadySaved) {
        const listingDataToSave = saveListingData(listing); // Save data with the function
        savedListings.push(listingDataToSave);
        sessionStorage.setItem("savedListings", JSON.stringify(savedListings));
        setIsSaved(true);
        console.log("Listings saved:", savedListings);
      }
    }
  };

  if (loading) return <p className="text-center mt-5">Loading listing details...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;
  if (!listing) return <p className="text-center mt-5">No listing found.</p>;

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

  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page for purpose of saved listings
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg">
            {listing.images && listing.images.length > 0 && (
              <Card.Img variant="top" src={listing.images[0]} alt={listing.address} />
            )}
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="text-center fs-3 fw-bold">{listing.address}</Card.Title>
                <Button variant="link" className="p-0" onClick={handleSaveListing}>
                  {isSaved ? <FaHeart color="red" size={24} /> : <FaRegHeart color="gray" size={24} />}
                </Button>
              </div>
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
                <Button variant="secondary" onClick={handleBackClick}>
                  ← Back
                </Button>
                <Button variant="success">Contact Landlord</Button>
              </div>

              <hr />
              <h5 className="fw-bold text-center">Price History</h5>
              <Line data={data} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default IndividualListings;