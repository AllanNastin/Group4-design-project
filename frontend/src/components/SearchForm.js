import { useState } from 'react';
import { Container, Form, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {

    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    const [validated, setValidated] = useState(false);

    const submitForm = (e) => {
        e.preventDefault();

        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
        }
        else {
            const formData = new FormData(e.target);
            const payload = Object.fromEntries(formData);
            navigate("/listings", { state: payload });
        }

        setValidated(true);
    }

    return (
        <Container className="mt-5">
            <Card className="shadow-lg">
                <Card.Body>
                    <Form noValidate validated={validated} onSubmit={submitForm}>
                        <Form.Check inline type="radio" label="Rent" name="type" value="rent" defaultChecked/>
                        <Form.Check inline type="radio" label="Buy" name="type" value="buy"/>
                        <Form.Group className="mb-3">
                            <Form.Label>I'm looking for properties in</Form.Label>
                            <Form.Control required type="text" name="location" placeholder="County, City, Town or Area"/>
                            <Form.Control.Feedback type="invalid">This field cannot be left blank</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>with commuter times to</Form.Label>
                            <Form.Control required type="text" name="commute" placeholder="County, City, Town or Area"/>
                            <Form.Control.Feedback type="invalid">This field cannot be left blank</Form.Control.Feedback>
                        </Form.Group>

                        {showFilters && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price</Form.Label>
                                    <div className="mb-3 d-flex align-items-center">
                                        <Form.Select aria-label="Default select example" name="price-min">
                                            <option>Min</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </Form.Select>
                                        <Form.Text style={{ color: 'white' }} className="mx-2">
                                            to
                                        </Form.Text>
                                        <Form.Select aria-label="Default select example" name="price-max">
                                            <option>Max</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Bedrooms</Form.Label>
                                    <div className="mb-3 d-flex align-items-center">
                                        <Form.Select aria-label="Default select example" name="beds-min">
                                            <option>Min</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </Form.Select>
                                        <Form.Text style={{ color: 'white' }} className="mx-2">
                                            to
                                        </Form.Text>
                                        <Form.Select aria-label="Default select example" name="beds-max">
                                            <option>Max</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Bathrooms</Form.Label>
                                    <div className="mb-3 d-flex align-items-center">
                                        <Form.Select aria-label="Default select example" name="baths-min">
                                            <option>Min</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </Form.Select>
                                        <Form.Text style={{ color: 'white' }} className="mx-2">
                                            to
                                        </Form.Text>
                                        <Form.Select aria-label="Default select example" name="baths-max">
                                            <option>Max</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Size</Form.Label>
                                    <div className="mb-3 d-flex align-items-center">
                                        <Form.Select aria-label="Default select example" name="size-min">
                                            <option>Min sq ft</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </Form.Select>
                                        <Form.Text style={{ color: 'white' }} className="mx-2">
                                            to
                                        </Form.Text>
                                        <Form.Select aria-label="Default select example" name="size-max">
                                            <option>Max sq ft</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                            </>
                        )}
                        <Button style={{ marginRight: '10px' }} variant="secondary" onClick={(e) => { e.preventDefault(); setShowFilters(!showFilters); }}>Filters</Button>
                        <Button variant="primary" type="submit">Submit</Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SearchForm;