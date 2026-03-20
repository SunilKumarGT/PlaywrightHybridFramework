@performance @api @regression
Feature: API Performance Testing
  As a QA engineer
  I want to verify that API endpoints respond within SLA thresholds
  So that the application remains performant under normal load

  Background:
    Given I have a valid API client
    And I authenticate with bearer token "valid-test-token"

  @smoke @performance
  Scenario: User list endpoint responds within SLA
    When I send a GET request to "/api/users"
    Then the response status code should be 200
    And the response time should be less than 1000 milliseconds

  @performance @regression
  Scenario: Product list endpoint responds within SLA
    When I send a GET request to "/api/products"
    Then the response status code should be 200
    And the response time should be less than 800 milliseconds

  @performance @regression
  Scenario: Search endpoint responds within SLA
    When I send a GET request to "/api/search/products" with query params:
      | q | laptop |
    Then the response status code should be 200
    And the response time should be less than 1500 milliseconds

  @performance @regression
  Scenario: Auth endpoint responds quickly
    When I send a POST request to "/api/auth/login" with body:
      """
      { "email": "testuser@example.com", "password": "Test@1234" }
      """
    Then the response time should be less than 2000 milliseconds

  @performance @regression
  Scenario: Order creation responds within SLA
    When I send a POST request to "/api/orders" with body:
      """
      {
        "items": [{ "productId": "1", "quantity": 1 }],
        "paymentMethod": "card"
      }
      """
    Then the response time should be less than 3000 milliseconds

  @performance @regression
  Scenario Outline: Paginated endpoints respond consistently
    When I send a GET request to "<endpoint>" with query params:
      | page     | <page> |
      | pageSize | 20     |
    Then the response status code should be 200
    And the response time should be less than 1500 milliseconds

    Examples:
      | endpoint      | page |
      | /api/users    | 1    |
      | /api/products | 1    |
      | /api/orders   | 1    |
      | /api/users    | 5    |
      | /api/products | 10   |
