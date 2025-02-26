import { render, screen, waitFor,fireEvent } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";
import IndividualListings from "./Pages/IndividualListings";
import ListingsParser from "./components/ListingsParser";
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock("axios");

test("renders loading message", async () => {
  <MemoryRouter initialEntries={["/listings"]}>
    <App />
  </MemoryRouter>
});