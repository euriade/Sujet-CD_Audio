import { defineConfig } from "cypress";

export default defineConfig({
    env: {
        apiUrl: "http://localhost:5005/api/cds",
    },
    e2e: {
        baseUrl: "http://localhost:5173",
        specPattern: "tests/e2e/**/*.cy.{js,jsx,ts,tsx}",
        supportFile: false,
    },
});
