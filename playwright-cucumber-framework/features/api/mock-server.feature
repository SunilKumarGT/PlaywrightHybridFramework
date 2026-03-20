@api @regression
Feature: API Tests with Mock Server
  As a QA engineer
  I want to test API client behaviour against a mock server
  So that I can test edge cases without depending on a real back-end

  # These scenarios start the in-process MockServer before each test.
  # The Given step sets BASE URL to http://localhost:4001.

  @regression
  Scenario: Client handles 500 Internal Server Error gracefully
    Given I set the base URL to "http://localhost:4001"
    And the API endpoint "/api/users" returns status 500
    When I send a GET request to "/api/users"
    Then the response status code should be 500

  @regression
  Scenario: Client handles 401 Unauthorized
    Given I set the base URL to "http://localhost:4001"
    And the API endpoint "/api/products" returns unauthorized
    When I send a GET request to "/api/products"
    Then the response status code should be 401

  @regression
  Scenario: Client handles 404 Not Found
    Given I set the base URL to "http://localhost:4001"
    And the API endpoint "/api/users/999" returns status 404
    When I send a GET request to "/api/users/999"
    Then the response status code should be 404

  @regression
  Scenario: Client receives mocked response body
    Given I set the base URL to "http://localhost:4001"
    And the API endpoint "/api/users" returns:
      """
      [{ "id": "mock-1", "email": "mock@example.com", "firstName": "Mock" }]
      """
    When I send a GET request to "/api/users"
    Then the response status code should be 200
    And the response body should be an array
    And the response array should have 1 items

  @regression
  Scenario: Slow API response is handled within timeout
    Given I set the base URL to "http://localhost:4001"
    And the API endpoint "/api/slow" is slow by 500 milliseconds
    When I send a GET request to "/api/slow"
    Then the response time should be less than 5000 milliseconds
