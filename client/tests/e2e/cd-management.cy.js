describe("CD Management", () => {
    const API_URL = Cypress.env("apiUrl");

    it("add, display and then delete a CD", () => {
        const newCD = {
            title: "Test CD",
            artist: "Test Artist",
            year: 2023,
        };

        cy.intercept("GET", `${API_URL}`, { body: [] }).as("getCDs");

        cy.visit("/");

        cy.intercept("POST", `${API_URL}`, {
            statusCode: 201,
            body: { id: 1, ...newCD },
        }).as("addCD");

        cy.intercept("GET", `${API_URL}`, {
            body: [{ id: 1, ...newCD }],
        }).as("getCDsAfterAdd");

        cy.get('input[name="title"]').type(newCD.title);
        cy.get('input[name="artist"]').type(newCD.artist);
        cy.get('input[name="year"]').type(newCD.year.toString());

        cy.contains('button[type="submit"]', "Ajouter").click();

        cy.wait("@addCD").then(({ response }) => {
            expect(response.statusCode).to.equal(201);
        });

        cy.contains("li", newCD.title)
            .should("be.visible")
            .and("contain.text", newCD.artist)
            .and("contain.text", newCD.year.toString());

        cy.intercept("DELETE", `${API_URL}/*`, {
            statusCode: 204,
        }).as("deleteCD");

        cy.intercept("GET", `${API_URL}`, {
            body: [],
        }).as("getCDsAfterDelete");

        cy.contains("li", newCD.title).within(() => {
            cy.get("button.delete-btn")
                .should("be.visible")
                .and("contain.text", "Supprimer")
                .click();
        });

        cy.wait("@deleteCD").then(({ response }) => {
            expect(response.statusCode).to.equal(204);
        });

        cy.contains("li", newCD.title).should("not.exist");
    });
});
