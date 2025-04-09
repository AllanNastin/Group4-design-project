import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import axios from 'axios';
import { motion } from "framer-motion";

const pageLimit = 12;

const ListingsParser = () => {
    const [listingsData, setListingsData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { state } = useLocation();
    const [commuteVar, setCommuteVar] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageInput, setPageInput] = useState(currentPage);

    useEffect(() => {
        const getListings = async () => {
            setLoading(true); // Show loading while fetching new page
            try {
                if (state === null) {
                    setError(`(State) Error loading listings`);
                    navigate("/search");
                }
                if (state.listingsData) {
                    setListingsData(state.listingsData);
                    setCommuteVar(state.commute);
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
                        "size-max": payload["size-max"],
                        page: currentPage, // Add page parameter
                      }
                    });

                    const status = response.status;
                    if (status === 200) {
                        setListingsData(response.data);
                        setCommuteVar(payload.commute);
                        setTotalPages(Math.ceil(response.data.total_results / pageLimit)); // Calculate total pages
                    } else {
                        setError(`(${status}) Error loading listings`);
                    }
                }
            } catch (error) {
                setError(`Error contacting server`);
            }
            setLoading(false); // Hide loading after fetching
        };
        getListings();
    }, [state, apiUrl, navigate, currentPage]); // Trigger fetch when currentPage changes

    const handleListingClick = (listing) => {
        navigate(`/listing/${listing.listing_id}/${commuteVar}`, {
            state: {
                listing: listing,
                commute: commuteVar,
                listingsData: listingsData,
                from: "/listings",
            },
        });
    };


    const handleBackClick = () => {
        navigate("/search");
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage); // Update page and trigger fetch
            setPageInput(newPage); // Sync input with current page
        }
    };

    const [hoveredId, setHoveredId] = useState(null);

    if (loading) {
        return (
            <motion.div
                key="loading" // Unique key for AnimatePresence
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center mt-5 d-flex flex-column align-items-center" // Center content
            >
                <div style={{ animation: "slideDown 0.6s ease-out" }}>
                    <Spinner animation="border" role="status" className="mb-3">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p>Loading Property Listings...</p>
                </div>
            </motion.div>
        );
    }
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
                                        <strong>Price:</strong> {listing.price === -1 ? "Unavailable " : `€${listing.price.toLocaleString()} `}
                                        <strong>Bedrooms:</strong> {listing.bedrooms ?? 'N/A'} | <strong>Bathrooms:</strong> {listing.bathrooms ?? 'N/A'} <br />
                                        <strong>Size:</strong> {listing.size ? `${listing.size} m²` : 'N/A'} <br />
                                        🚗 {listing.commute_times?.car} min | 🚶 {listing.commute_times?.walk} min | 🚲 {listing.commute_times?.cycling} min | 🚌 {listing.commute_times?.public} min
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
            {listingsData.listings.length > 0 && totalPages > 1 && ( // Show buttons only if more than one page
                <div className="d-flex justify-content-center mt-2">
                    <span className="mx-3 align-self-center">
                        Page{" "}
                        <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onBlur={() => {
                                const newPage = parseInt(pageInput, 10);
                                if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
                                    handlePageChange(newPage);
                                } else {
                                    setPageInput(currentPage); // Reset to current page if invalid
                                }
                            }}
                            className="form-control d-inline-block"
                            style={{ width: "60px", textAlign: "center" }}
                        />{" "}
                        of {totalPages}
                    </span>
                </div>
            )}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-1 mb-5">
                    <Button
                        variant="secondary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isStart = pageNumber <= 2; // Always show the first two pages
                        const isEnd = pageNumber > totalPages - 2; // Always show the last two pages
                        const isNearCurrent = Math.abs(pageNumber - currentPage) <= 1; // Show pages near the current page

                        if (isStart || isEnd || isNearCurrent) {
                            return (
                                <Button
                                    key={pageNumber}
                                    variant={pageNumber === currentPage ? "primary" : "outline-secondary"}
                                    className="mx-1"
                                    onClick={() => handlePageChange(pageNumber)}
                                >
                                    {pageNumber}
                                </Button>
                            );
                        }

                        // Add ellipsis for truncation
                        if (pageNumber === 3 && currentPage > 4) {
                            return <span key="start-ellipsis" className="mx-2 align-self-center">...</span>;
                        }
                        if (pageNumber === totalPages - 2 && currentPage < totalPages - 3) {
                            return <span key="end-ellipsis" className="mx-2 align-self-center">...</span>;
                        }

                        return null;
                    })}
                    <Button
                        variant="secondary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default ListingsParser;