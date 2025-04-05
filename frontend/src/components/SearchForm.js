import { useState, useEffect } from "react";
import { Container, Form, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const SearchForm = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [eircodeList, setEircodeList] = useState([]);
    const [selectedPropertyEircode, setSelectedPropertyEircode] = useState("");
    const [commuteLocation, setCommuteLocation] = useState("");
    const [validated, setValidated] = useState(false);
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/Eircodes.json")
            .then((response) => response.json())
            .then((jsonData) => {
                const eircodeArray = Object.entries(jsonData).map(([location, code]) => ({
                    location,
                    code,
                }));
                setEircodeList(eircodeArray);
            })
            .catch((error) => console.error("Error loading Eircodes:", error));
    }, []);

    const propertyOptions = eircodeList.map((entry) => ({
        label: `${entry.location} (${entry.code})`,
        value: entry.code,
    }));

    // --- Price Validation Logic ---
    const handlePriceMinBlur = () => {
        // Check only if both fields have values that can be parsed as numbers
        const min = parseFloat(priceMin);
        const max = parseFloat(priceMax);

        if (!isNaN(min) && !isNaN(max) && min > max) {
            // If min is greater than max, set max equal to min
            setPriceMax(priceMin);
        }
    };

    const handlePriceMaxBlur = () => {
        // Check only if both fields have values that can be parsed as numbers
        const min = parseFloat(priceMin);
        const max = parseFloat(priceMax);

        if (!isNaN(min) && !isNaN(max) && max < min) {
            // If max is less than min, set min equal to max
            setPriceMin(priceMax);
        }
    };
    // --- End Price Validation Logic ---

    const submitForm = (e) => {
        e.preventDefault();
        console.log("Submit button clicked!");

        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            const formData = new FormData(e.target);
            let payload = Object.fromEntries(formData);

            payload.commute = commuteLocation;
            payload.location = selectedPropertyEircode;

            // Ensure correct price values from state are used,
            // as FormData might not capture the updated state from blur events perfectly
            // if submit happens immediately after blur without re-render.
            // Also handles sending empty strings if fields are empty.
            payload["price-min"] = priceMin || "";
            payload["price-max"] = priceMax || "";
            payload["beds"] = formData.get("beds") || "";
            payload["baths"] = formData.get("baths") || "";
            payload["size-min"] = formData.get("size-min") || "";
            payload["size-max"] = formData.get("size-max") || "";


            console.log("Form payload being sent:", payload);

            navigate("/listings", { state: { payload } });
        }

        setValidated(true);
    };

    return (
        <Container className="mt-5">
            <Card className="shadow-lg">
                <Card.Body>
                    <Form noValidate validated={validated} onSubmit={submitForm}>
                        <Form.Check inline type="radio" label="Rent" name="type" value="rent" defaultChecked />
                        <Form.Check inline type="radio" label="Buy" name="type" value="sale" />

                        {/* ✅ Property Eircode Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>I'm looking for properties in</Form.Label>
                            <Select
                                name="location"
                                options={propertyOptions}
                                placeholder="Please select a location..."
                                onChange={(option) => setSelectedPropertyEircode(option.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please select a property eircode.
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* ✅ Commute Field as Free Text */}
                        <Form.Group className="mb-3">
                            <Form.Label>with commuter times to</Form.Label>
                            <Form.Control
                                type="text"
                                name="commute"
                                placeholder="Enter a location (e.g. Dublin City Centre)"
                                value={commuteLocation}
                                onChange={(e) => setCommuteLocation(e.target.value)}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter a commute location.
                            </Form.Control.Feedback>
                        </Form.Group>

                        {showFilters && (
                            <>
                                {/* Price Range */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Price (€)</Form.Label>
                                    <div className="mb-3 d-flex align-items-center">
                                        <Form.Control
                                            type="number"
                                            name="price-min" // Keep name for FormData
                                            placeholder="Min"
                                            value={priceMin}
                                            onChange={(e) => setPriceMin(e.target.value)} // Only update state on change
                                            onBlur={handlePriceMinBlur} // Validate/adjust on blur
                                            step="any" // Allow decimals
                                        />
                                        <Form.Text className="mx-2">to</Form.Text>
                                        <Form.Control
                                            type="number"
                                            name="price-max" // Keep name for FormData
                                            placeholder="Max"
                                            value={priceMax}
                                            onChange={(e) => setPriceMax(e.target.value)} // Only update state on change
                                            onBlur={handlePriceMaxBlur} // Validate/adjust on blur
                                            step="any" // Allow decimals
                                        />
                                    </div>
                                </Form.Group>

                                {/* Bedrooms */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Bedrooms</Form.Label>
                                    <Form.Select name="beds">
                                        <option value="">Any</option>
                                        <option value="1">1+</option>
                                        <option value="2">2+</option>
                                        <option value="3">3+</option>
                                        <option value="4">4+</option>
                                        <option value="5">5+</option>
                                    </Form.Select>
                                </Form.Group>

                                {/* Bathrooms */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Bathrooms</Form.Label>
                                    <Form.Select name="baths">
                                        <option value="">Any</option>
                                        <option value="1">1+</option>
                                        <option value="2">2+</option>
                                        <option value="3">3+</option>
                                        <option value="4">4+</option>
                                        <option value="5">5+</option>
                                    </Form.Select>
                                </Form.Group>

                                {/* Size (sq ft) */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Size (sq ft)</Form.Label>
                                    <div className="mb-3 d-flex align-items-center">
                                        <Form.Select name="size-min">
                                            <option>Min</option>
                                            <option value="500">500 sq ft</option>
                                            <option value="1000">1,000 sq ft</option>
                                            <option value="1500">1,500 sq ft</option>
                                            <option value="2000">2,000 sq ft</option>
                                            <option value="3000">3,000 sq ft</option>
                                        </Form.Select>
                                        <Form.Text className="mx-2">to</Form.Text>
                                        <Form.Select name="size-max">
                                            <option>Max</option>
                                            <option value="1000">1,000 sq ft</option>
                                            <option value="1500">1,500 sq ft</option>
                                            <option value="2000">2,000 sq ft</option>
                                            <option value="3000">3,000 sq ft</option>
                                            <option value="4000">4,000+ sq ft</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                            </>
                        )}

                        {/* Buttons */}
                        <Button
                            style={{ marginRight: "10px" }}
                            variant="secondary"
                            onClick={(e) => { e.preventDefault(); setShowFilters(!showFilters); }}
                        >
                            {showFilters ? "Hide Filters" : "Show Filters"}
                        </Button>
                        <Button variant="primary" type="submit" disabled={!selectedPropertyEircode || !commuteLocation}>
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SearchForm;
