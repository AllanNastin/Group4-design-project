import React, { useState, useEffect } from "react";

const ListingsParser = () => {
    const [listingsData, setListingsData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // read JSON and convert
    useEffect(() => {
        fetch("/sample.json") // make sure JSON file under the public folder
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json(); // convert JSON
            })
            .then((jsonData) => {
                setListingsData(jsonData); // save in state
            })
            .catch((err) => {
                setError(`Error loading JSON: ${err.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading property listings...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!listingsData || !listingsData.listings || listingsData.listings.length === 0)
        return <p>No properties found.</p>;

    return (
        <div>
            <h1>Property Listings</h1>
            <h2>Total Results: {listingsData.total_results}</h2>

            {listingsData.listings.map((listing) => (
                <div key={listing.listing_id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
                    <h3>Listing ID: {listing.listing_id}</h3>
                    <p><strong>Address:</strong> {listing.address}</p>
                    <p><strong>Eircode:</strong> {listing.eircode}</p>
                    <p><strong>Bedrooms:</strong> {listing.bedrooms}</p>
                    <p><strong>Bathrooms:</strong> {listing.bathrooms}</p>
                    <p><strong>Size:</strong> {listing.size} sq ft</p>
                    <p><strong>Price:</strong> €{listing.price.toLocaleString()}</p>
                    <p><strong>Current Price:</strong> €{listing.current_price.toLocaleString()}</p>
                    <p><strong>Commute Times:</strong> 🚗 {listing.commute_times?.car} min | 🚶‍ {listing.commute_times?.walk} min</p>

                    {listing.images && listing.images.length > 0 && (
                        <div>
                            <h4>Property Images:</h4>
                            {listing.images.map((img, imgIndex) => (
                                <img key={imgIndex} src={img} alt={`Property ${listing.listing_id}`} />

                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ListingsParser;
