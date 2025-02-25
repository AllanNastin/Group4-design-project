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

    // ✅ Fetch Eircodes.json dynamically
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
                        <Form.Check inline type="radio" label="Buy" name="type" value="buy" />

                        {/* ✅ Property Eircode Dropdown */}
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
                            <Form.Control.Feedback type="invalid">Please select a property eircode.</Form.Control.Feedback>
                        </Form.Group>

                        {/* ✅ Commute Eircode Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>with commuter times to</Form.Label>
                            <Form.Select
                                name="commute"
                                value={selectedCommuteEircode}
                                onChange={(e) => setSelectedCommuteEircode(e.target.value)}
                                required
                            >
                                <option value="">-- Select an Eircode --</option>
                                {eircodeList.map((entry) => (
                                    <option key={entry.location} value={entry.code}>
                                        {entry.location} ({entry.code})
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Please select a commute eircode.</Form.Control.Feedback>
                        </Form.Group>

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
