import { useState, useEffect } from "react";
import { Container, Form, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [eircodeList, setEircodeList] = useState([]);
    const [selectedEircode, setSelectedEircode] = useState("");
    const [validated, setValidated] = useState(false); // Validation from `dev`
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
            payload.eircode = selectedEircode; // ✅ Includes the selected eircode
            console.log(payload);
            navigate("/listings", { state: { searchParams: payload } });
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

                        {/* ✅ Eircode Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>I'm looking for properties in</Form.Label>
                            <Form.Select
                                name="eircode"
                                value={selectedEircode}
                                onChange={(e) => setSelectedEircode(e.target.value)}
                                required
                            >
                                <option value="">-- Select an Eircode --</option>
                                {eircodeList.map((entry) => (
                                    <option key={entry.code} value={entry.code}>
                                        {entry.location} ({entry.code})
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Please select an eircode.</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>with commuter times to</Form.Label>
                            <Form.Control required type="text" name="commute" placeholder="County, City, Town or Area" />
                            <Form.Control.Feedback type="invalid">This field cannot be left blank</Form.Control.Feedback>
                        </Form.Group>

                        {/* Buttons */}
                        <Button
                            style={{ marginRight: "10px" }}
                            variant="secondary"
                            onClick={(e) => { e.preventDefault(); setShowFilters(!showFilters); }}
                        >
                            Filters
                        </Button>
                        <Button variant="primary" type="submit" disabled={!selectedEircode}>
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SearchForm;
