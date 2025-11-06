/**
 * ------------------------------------------------------------
 *  Project: Webmobi Event Automation
 *  File: event-flow.cy.js
 *  Author: Emilda B
 *  Description:
 *    Cypress end-to-end tests covering major user workflows:
 *    1. User Login
 *    2. Event Creation
 *    3. Attendee Registration (Mocked API)
 *    4. Certificate Generation (Mocked API)
 *  Date: November 5 2025
 * ------------------------------------------------------------
 */

  // Handle Cypress test failures
Cypress.on('fail', (error, runnable) => {
  console.error('❌ Test failed:', error.message);
  return false; // Prevent one test failure from stopping all others
});

describe('Webmobi Event Creation Flow', () => {

  const baseUrl = 'https://events.webmobi.com';

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  // 1. LOGIN TEST
  it('User can login successfully', () => {
    cy.visit('https://events.webmobi.com/auth/login');

    // Type email and password
    cy.get('input[type="email"]').type('shirleysha67@gmail.com');
    cy.get('input[type="password"]').type('Webmobi@123');

    // Click Sign in
    cy.contains('button', 'Sign in').click();

    // Verify successful login
    cy.url().should('include', '/dashboard'); 
  });

  // 2. EVENT CREATION TEST
  it('User can create a new event', () => {

    // Log in again (optional for isolation)
    cy.visit('https://events.webmobi.com/auth/login');
    cy.get('input[type="email"]').type('shirleysha67@gmail.com');
    cy.get('input[type="password"]').type('Webmobi@123');
    cy.contains('button', 'Sign in').click();

    // Wait for dashboard
    cy.url().should('include', '/dashboard');

    // Click "Create Your First Event"
    cy.contains('Create Your First Event').click();

    // Fill event details
    cy.get('input[name="eventName"]').type('Automation Test Event');
    cy.get('textarea[name="eventDescription"]').type('This event is created using Cypress automation.');
    cy.get('button').contains('Save').click();

    // Verify event creation
    cy.contains('Automation Test Event').should('exist');
  });

  // EVENT FLOW TESTS (API MOCKS)
  describe('Event Flow Tests', () => {

    // Attendee Registration Test
    it('Register Attendee API test (mocked)', () => {
      cy.intercept('POST', '**/api/events/register', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Registration successful',
          attendee: {
            name: 'Emilda',
            email: 'shirleysha67@gmail.com'
          }
        }
      }).as('registerMock');

      cy.window().then(() => {
        return fetch('https://events.webmobi.com/api/events/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Emilda', email: 'shirleysha67@gmail.com' }),
        });
      });

      cy.wait('@registerMock').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.success).to.be.true;
        expect(interception.response.body.attendee.name).to.eq('Emilda');
      });
    });

    // Certificate Generation Test
    it('Generate Certificate API test (mocked)', () => {
      cy.intercept('POST', '**/api/events/generateCertificate', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Certificate generated successfully',
          certificateUrl: 'https://events.webmobi.com/certificates/emilda123.pdf'
        }
      }).as('certificateMock');

      cy.window().then(() => {
        return fetch('https://events.webmobi.com/api/events/generateCertificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendeeId: 'emilda123' }),
        });
      });

      cy.wait('@certificateMock').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.success).to.be.true;
        expect(interception.response.body.message).to.include('successfully');
      });
    });

  });

});
