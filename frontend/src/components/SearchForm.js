import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const SearchForm = () => {

    const submitForm = (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData);

        console.log(payload);
    }

    return (
        <form onSubmit={submitForm}>
            <Form.Group className="mb-3">
                <Form.Label>I'm looking for properties in</Form.Label>
                <Form.Control type="text" name="location" placeholder="County, City, Town or Area"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>with commuter times to</Form.Label>
                <Form.Control type="text" name="commute" placeholder="County, City, Town or Area"/>
            </Form.Group>
            <Button type="submit">Submit</Button>
         </form>
    );
};

export default SearchForm;