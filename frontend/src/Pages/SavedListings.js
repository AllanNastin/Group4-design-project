import React, { useState, useEffect } from "react";
import { Spinner } from 'react-bootstrap';
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from 'axios';

const SavedListings = () => {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const location = useLocation();
  const isFromRecommended = location.pathname.includes("recommended");

  useEffect(() => {
    const fetchSavedListing = async (google_token) => {
      const response = await axios.get(`${apiUrl}/saveListing`, {
        params: {
          id_token: google_token
        }
      });
      const savedLinks = response.data;
      // get params from link
      const regex = /\/listing\/([^\/]+\/[^\/]+\/[^\/]+\/[^\/]+\/[^\/]+)/;
      let theSavedListing = [];
      console.log(savedLinks);
      for (let i = 0; i < savedLinks.length; i++) {
        const match = savedLinks[i][0].match(regex);
        console.log(match);
        const pathname = new URL(savedLinks[i][0]).pathname;
        const parts = pathname.split("/");
        console.log(parts);
        if (match) {
          const extracted = match[1];
          const paramsFromLink = extracted.split('/');
          console.log(paramsFromLink);
          // fetch details
          const detailResponse = await axios.get(`${apiUrl}/getListing`, {
            params: {
              listing_id: paramsFromLink[0]
            }
          });
          let listingDetail = detailResponse.data;
          listingDetail.commute_times = {
            car: paramsFromLink[1],
            walk: paramsFromLink[2],
            cycling: paramsFromLink[3],
            public: paramsFromLink[4]
          }
          listingDetail.url = `/listing/${extracted}/to`;
          console.log(listingDetail);
          theSavedListing.push(listingDetail);
          setLoading(false);
        }
      }
      console.log(theSavedListing);
      setSavedListings(theSavedListing);
    }
    const google_token = localStorage.getItem("google_token")
    fetchSavedListing(google_token);
    // get params from the link
    //console.log(saved);
  }, []);


  const handleListingClick = (listing) => {
    navigate(listing.url, { state: { listing: listing, commute: listing.commute } });
  };

  return (
    loading ? (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    ) :
      (<Container className="mt-5">
        <h1 className="text-center mb-4">{savedListings.length === 0 ? "No Saved Listings" : "Saved Listings"}</h1>
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

                    <strong>Price:</strong> {listing.current_price === -1 ? " Unavailable " : `€${listing.current_price.toLocaleString()} `} <br />
                    <strong>Bedrooms:</strong> {listing.bedrooms !== null ? listing.bedrooms : 'N/A'} | <strong>Bathrooms:</strong> {listing.bathrooms !== null ? listing.bathrooms : 'N/A'} <br />

                  <strong>Size:</strong> {listing.size !== null ? `${listing.size} m²` : 'N/A'} <br />

                    {!isFromRecommended &&
                      listing.commute_times &&
                      listing.commute_times.car !== "None" &&
                      listing.commute_times.walk !== "None" &&
                      listing.commute_times.cycling !== "None" &&
                      listing.commute_times.public !== "None" && (
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
      )
  );
};

export default SavedListings;
