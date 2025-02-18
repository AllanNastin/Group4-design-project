import { render, screen } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";
import IndividualListings from "./Pages/IndividualListings";
import App from './App';

test("renders loading message", () => {
    render(<App />);
    const loadingElement = screen.getByText(/loading property listings/i);
    expect(loadingElement).toBeInTheDocument();
});


test("renders ListingsParser on the homepage", () => {
    render(<App />);

    const element = screen.getByText(/loading property listings/i);
    expect(element).toBeInTheDocument();
});

test("renders IndividualListings", () => {
    render(
        <MemoryRouter initialEntries={["/listing/1"]}>
            <IndividualListings />
        </MemoryRouter>
    );

    const loadingElement = screen.getByText(/loading listing details/i);
    expect(loadingElement).toBeInTheDocument();
});



