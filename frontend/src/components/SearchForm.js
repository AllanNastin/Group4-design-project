import { useState, useEffect } from "react";
import { Container, Form, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [eircodeList, setEircodeList] = useState([]);
    const [selectedPropertyEircode, setSelectedPropertyEircode] = useState("");
    const [selectedCommuteEircode, setSelectedCommuteEircode] = useState("");
    const [validated, setValidated] = useState(false);
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

    const submitForm = (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            const formData = new FormData(e.target);
            const payload = Object.fromEntries(formData);
            console.log("Form payload:", payload);
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

                        {/* Property Eircode Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>I'm looking for properties in</Form.Label>
                            <Form.Select
                                name="location"
                                value={selectedPropertyEircode}
                                onChange={(e) => setSelectedPropertyEircode(e.target.value)}
                                required
                            >
                                <option value="">-- Select an Eircode --</option>
                                {eircodeList.map((entry) => (
                                    <option key={entry.location} value={entry.code}>
                                        {entry.location} ({entry.code})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Commute Eircode Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>with commuter times to</Form.Label>
                            <Form.Control
                                type="text"
                                name="commute"
                                placeholder="Enter destination (e.g. Dublin City Centre)"
                                required
                            />
                            <Form.Control.Feedback type="invalid">This field cannot be left blank</Form.Control.Feedback>
                        </Form.Group>

                        {showFilters && (
                            <>
                                {/* Price Range */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Price (€)</Form.Label>
                                    <div className="mb-3 d-flex align-items-center">
                                        <Form.Select name="price-min">
                                            <option>Min</option>
                                            <option value="50000">€50,000</option>
                                            <option value="100000">€100,000</option>
                                            <option value="200000">€200,000</option>
                                            <option value="300000">€300,000</option>
                                            <option value="500000">€500,000</option>
                                        </Form.Select>
                                        <Form.Text className="mx-2">to</Form.Text>
                                        <Form.Select name="price-max">
                                            <option>Max</option>
                                            <option value="100000">€100,000</option>
                                            <option value="200000">€200,000</option>
                                            <option value="300000">€300,000</option>
                                            <option value="500000">€500,000</option>
                                            <option value="1000000">€1,000,000+</option>
                                        </Form.Select>
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
                            Filters
                        </Button>
                        <Button variant="primary" type="submit" disabled={!selectedPropertyEircode || !selectedCommuteEircode}>
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SearchForm;
