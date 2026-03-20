@api @regression
Feature: Orders API
  As an authenticated user
  I want to manage orders via the REST API
  So that I can create, view, and track orders

  Background:
    Given I have a valid API client
    And I authenticate with bearer token "valid-test-token"

  @smoke
  Scenario: Get all orders for authenticated user
    When I send a GET request to "/api/orders"
    Then the response status code should be 200
    And the response body should be an array
    And the response time should be less than 2000 milliseconds

  @regression
  Scenario: Create a new order
    When I send a POST request to "/api/orders" with body:
      """
      {
        "items": [
          { "productId": "1", "quantity": 2 }
        ],
        "shippingAddress": {
          "firstName": "John",
          "lastName":  "Doe",
          "address":   "123 Test Street",
          "city":      "Chennai",
          "zip":       "600001",
          "country":   "IN"
        },
        "paymentMethod": "card"
      }
      """
    Then the response status code should be 201
    And the response body should contain "orderId"
    And the response body should contain "status"
    And I store the response field "orderId" as "createdOrderId"

  @regression
  Scenario: Get order by ID
    When I send a GET request to "/api/orders/1"
    Then the response status code should be 200
    And the response body should contain "orderId"
    And the response body should contain "items"
    And the response body should contain "status"

  @regression
  Scenario: Cancel an order
    When I send a PATCH request to "/api/orders/1" with body:
      """
      { "status": "cancelled" }
      """
    Then the response status code should be 200
    And the response body field "status" should equal "cancelled"

  @regression
  Scenario: Get orders with pagination
    When I send a GET request to "/api/orders" with query params:
      | page     | 1  |
      | pageSize | 5  |
    Then the response status code should be 200
    And the response body should be an array

  @regression
  Scenario: Order with empty items list returns 400
    When I send a POST request to "/api/orders" with body:
      """
      { "items": [] }
      """
    Then the response status code should be 400

  @regression
  Scenario: Get non-existent order returns 404
    When I send a GET request to "/api/orders/999999999"
    Then the response status code should be 404

  @regression
  Scenario: Order history is filtered by status
    When I send a GET request to "/api/orders" with query params:
      | status | completed |
    Then the response status code should be 200
    And the response body should be an array
