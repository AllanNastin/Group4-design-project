import "@testing-library/jest-dom";

global.matchMedia = global.matchMedia || function () {
    return {
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
    };
};

beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation((message) => {
        if (message.includes("act(...)")) return;
        console.warn(message);
    });
});

afterAll(() => {
    jest.restoreAllMocks();
});
