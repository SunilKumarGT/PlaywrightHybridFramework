@ai @api @regression
Feature: AI-Powered API Analysis
  As a QA engineer
  I want AI to intelligently verify API responses
  So that I can catch data quality and security issues automatically

  Background:
    Given I have a valid API client
    And I authenticate with bearer token "valid-test-token"

  @smoke @ai
  Scenario: AI verifies user list response quality
    When I send a GET request to "/api/users"
    Then the response status code should be 200
    And AI should verify that "the response is a valid list of users with proper id, email, and name fields"

  @ai @regression
  Scenario: AI analyzes user creation response for anomalies
    When I send a POST request to "/api/users" with body:
      """
      {
        "firstName": "AI",
        "lastName": "Tester",
        "email": "ai.tester@example.com"
      }
      """
    Then the response status code should be 201
    And AI analyzes the API response for anomalies
    And the AI analysis should have no critical issues

  @ai @regression
  Scenario: AI verifies response does not expose sensitive data
    When I send a GET request to "/api/users/1"
    Then the response status code should be 200
    And AI should verify that "the response does not contain sensitive data like passwords, tokens, or internal IDs"

  @ai @regression
  Scenario: AI verifies product price format is correct
    When I send a GET request to "/api/products/1"
    Then the response status code should be 200
    And AI should verify that "product price is a positive number with at most 2 decimal places"

  @ai @regression
  Scenario: AI verifies paginated list structure
    When I send a GET request to "/api/users" with query params:
      | page     | 1  |
      | pageSize | 5  |
    Then the response status code should be 200
    And AI should verify that "response has pagination metadata including total count, current page, and page size"
