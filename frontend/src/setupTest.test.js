import "@testing-library/jest-dom";

test("jest-dom is working", () => {
    document.body.innerHTML = "<div data-testid='element'>Hello</div>";
    const element = document.querySelector("[data-testid='element']");
    expect(element).toBeInTheDocument();
});

test("window.matchMedia is mocked", () => {
    expect(window.matchMedia).toBeDefined();
});

