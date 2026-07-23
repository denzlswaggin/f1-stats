
Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('NEXT_REDIRECT')) {
        return false;
    }
    return true;
});

describe('Packs & Collection E2E Tests', () => {

    it('Should require login to view and open packs', () => {
        cy.visit('http://localhost:3000/packs')

        cy.get('.auth-container').should('be.visible')
        cy.get('.auth-title').contains('Unlock Card Packs').should('be.visible')
    })

    it('Login, open a pack, and sell a card from the collection', () => {
        cy.visit('http://localhost:3000/login')
        cy.get('#email').type('e2etester@f1stats.com')
        cy.get('#password').type('testing123')
        cy.get('button[type="submit"]').click()

        cy.url({ timeout: 10000 }).should('not.include', '/login')

        cy.visit('http://localhost:3000/packs')

        cy.wait(1000)
        cy.get('.pack-opener-container').should('be.visible')

        cy.get('#open-pack-btn').should('not.have.class', 'disabled').click()

        cy.get('.pack-reveal', { timeout: 10000 }).should('be.visible')
        cy.get('.pack-card-image').should('be.visible')

        cy.get('#close-card-btn').click()

        cy.visit('http://localhost:3000/collection')

        cy.wait(1000)
        cy.get('.collection-grid').should('be.visible')

        cy.get('.collection-card').first().within(() => {

            cy.get('.sell-btn').click({ force: true })
        })

        cy.wait(2000)
    })
})
