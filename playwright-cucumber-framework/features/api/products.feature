@api @regression
Feature: Products API
  As an API consumer
  I want to manage products via the REST API
  So that I can perform CRUD operations on product records

  Background:
    Given I have a valid API client
    And I authenticate with bearer token "valid-test-token"

  @smoke
  Scenario: Get all products
    When I send a GET request to "/api/products"
    Then the response status code should be 200
    And the response body should be an array
    And the response time should be less than 2000 milliseconds

  @regression
  Scenario: Get single product
    When I send a GET request to "/api/products/1"
    Then the response status code should be 200
    And the response should match the product schema

  @regression
  Scenario: Create a product
    When I send a POST request to "/api/products" with body:
      """
      {
        "name": "Test Product",
        "price": 99.99,
        "description": "A test product",
        "category": "electronics"
      }
      """
    Then the response status code should be 201
    And the response body field "name" should equal "Test Product"

  @regression
  Scenario: Product price must be positive
    When I send a POST request to "/api/products" with body:
      """
      {
        "name": "Negative Price Product",
        "price": -10.00
      }
      """
    Then the response status code should be 400

  @regression
  Scenario Outline: Filter products by category
    When I send a GET request to "/api/products" with query params:
      | category | <category> |
    Then the response status code should be 200
    And the response body should be an array

    Examples:
      | category    |
      | electronics |
      | clothing    |
      | books       |
