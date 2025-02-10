import React, { useState, useEffect } from "react";

const ListingsParser = () => {
    const [listingsData, setListingsData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // read JSON and convert
    useEffect(() => {
        fetch("/Sample.json") // make sure JSON file under the public folder
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
                setError(`error to load JSON: ${err.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <p>loading data message...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!listingsData || !listingsData.listings) return <p>can't find the properties</p>;

    return (
        <div>
            <h1>properties list</h1>
            <h2>: {listingsData.total_results}</h2>

            {listingsData.listings.map((listing, index) => (
                <div key={index} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
                    <h3>ListingID {listing.listing_id}</h3>
                    <p><strong>Address:</strong> {listing.address}</p>
                    <p><strong>Eircode:</strong> {listing.eircode}</p>
                    <p><strong>Bedrooms:</strong> {listing.bedrooms}</p>
                    <p><strong>Bathrooms:</strong> {listing.bathrooms}</p>
                    <p><strong>Size:</strong> {listing.size}</p>
                    <p><strong>Price:</strong> €{listing.price}</p>
                    <p><strong>Current Price:</strong> {listing.current_price}</p>
                    <p><strong>commute_times:</strong> 🚗 {listing.commute_times?.car} min | 🚶‍ {listing.commute_times?.walk} min</p>

                    {listing.images && listing.images.length > 0 && (
                        <div>
                            <h4>property image:</h4>
                            {listing.images.map((img, imgIndex) => (
                                <img key={imgIndex} src={img} alt={`property ${index} image ${imgIndex}`} style={{ width: "200px", margin: "5px" }} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ListingsParser;
