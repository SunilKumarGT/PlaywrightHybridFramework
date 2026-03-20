@ai @regression
Feature: AI-Powered UI Analysis
  As a QA engineer
  I want to use AI to analyze UI screenshots
  So that I can detect visual bugs and accessibility issues automatically

  Background:
    Given I navigate to "/"

  @smoke @ai
  Scenario: AI analyzes homepage for visual issues
    When I analyze the current page screenshot for "visual bugs, layout issues, broken elements"
    Then the AI analysis should have no critical issues
    And the AI confidence score should be at least 0.7

  @ai @regression
  Scenario: AI checks login page accessibility
    Given I am on the login page
    When AI analyzes the page for accessibility
    Then the accessibility score should be at least 70

  @ai @regression
  Scenario: AI detects issues on error page
    Given I navigate to "/non-existent-page"
    When I analyze the current page screenshot for "404 error page correctness, user-friendly messaging"
    Then the AI analysis should have no critical issues

  @ai @regression
  Scenario: AI verifies dashboard loads correctly after login
    Given I am logged in as "standard_user"
    When I analyze the current page screenshot for "dashboard completeness, all widgets loaded, no missing data"
    Then the AI analysis should have no high severity issues

  @ai @regression
  Scenario: AI generates test cases for user registration
    When AI generates test cases for:
      """
      User Story: As a new visitor, I want to register an account
      so that I can access premium features.

      Acceptance Criteria:
      - User must provide name, email, and password
      - Email must be unique and valid format
      - Password must be at least 8 chars with uppercase, lowercase, number
      - User receives a confirmation email after registration
      - User is redirected to dashboard after successful registration
      """
    Then AI should generate at least 5 test cases

  @ai @regression
  Scenario: AI generates Gherkin for checkout flow
    When AI generates Gherkin scenarios for:
      """
      E-commerce checkout flow:
      - User adds items to cart
      - User views cart and proceeds to checkout
      - User enters shipping address
      - User selects payment method (credit card, PayPal)
      - Order is confirmed with email receipt
      - User can track order status
      """
    Then the element "body" should be visible
