import { useState, useEffect } from "react";
import { Container, Form, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [eircodeList, setEircodeList] = useState([]);
    const [selectedEircode, setSelectedEircode] = useState("");
    const navigate = useNavigate();

    // Fetch Eircodes.json dynamically
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
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData);
        payload.eircode = selectedEircode;
        console.log(payload);
        navigate("/listings", { state: { searchParams: payload } });
    };

    return (
        <Container className="mt-5">
            <Card className="shadow-lg">
                <Card.Body>
                    <form onSubmit={submitForm}>
                        <Form.Check inline type="radio" label="Rent" name="type" value="rent" defaultChecked />
                        <Form.Check inline type="radio" label="Buy" name="type" value="buy" />

                        {/* Eircode Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>I'm looking for properties in</Form.Label>
                            <Form.Select
                                name="eircode"
                                value={selectedEircode}
                                onChange={(e) => setSelectedEircode(e.target.value)}
                            >
                                <option value="">-- Select an Eircode --</option>
                                {eircodeList.map((entry) => (
                                    <option key={entry.code} value={entry.code}>
                                        {entry.location} ({entry.code})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>with commuter times to</Form.Label>
                            <Form.Control type="text" name="commute" placeholder="County, City, Town or Area" />
                        </Form.Group>

                        {/* Buttons */}
                        <Button style={{ marginRight: "10px" }} variant="secondary" onClick={(e) => { e.preventDefault(); setShowFilters(!showFilters); }}>
                            Filters
                        </Button>
                        <Button variant="primary" type="submit" disabled={!selectedEircode}>
                            Submit
                        </Button>
                    </form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SearchForm;
