@api @regression
Feature: Search API
  As an API consumer
  I want to search for users and products
  So that I can retrieve filtered, relevant results quickly

  Background:
    Given I have a valid API client
    And I authenticate with bearer token "valid-test-token"

  # ─── Product search ────────────────────────────────────────────────────────

  @smoke
  Scenario: Search products by keyword
    When I send a GET request to "/api/search/products" with query params:
      | q | laptop |
    Then the response status code should be 200
    And the response body should be an array
    And the response time should be less than 2000 milliseconds

  @regression
  Scenario: Search returns empty array for no matches
    When I send a GET request to "/api/search/products" with query params:
      | q | xyznonexistentproduct12345 |
    Then the response status code should be 200
    And the response body should be an array
    And the response array should have 0 items

  @regression
  Scenario: Search with category filter
    When I send a GET request to "/api/search/products" with query params:
      | q        | phone       |
      | category | electronics |
    Then the response status code should be 200
    And the response body should be an array

  @regression
  Scenario: Search with price range filter
    When I send a GET request to "/api/search/products" with query params:
      | q        | headphones |
      | minPrice | 10         |
      | maxPrice | 200        |
    Then the response status code should be 200
    And the response body should be an array

  @regression
  Scenario: Search with sorting
    When I send a GET request to "/api/search/products" with query params:
      | q       | phone      |
      | sortBy  | price      |
      | sortDir | asc        |
    Then the response status code should be 200
    And the response body should be an array

  @regression
  Scenario: Search with pagination
    When I send a GET request to "/api/search/products" with query params:
      | q        | phone |
      | page     | 1     |
      | pageSize | 5     |
    Then the response status code should be 200
    And the response body should be an array

  # ─── User search (admin only) ───────────────────────────────────────────────

  @regression
  Scenario: Admin can search users by email
    When I send a GET request to "/api/search/users" with query params:
      | q | testuser |
    Then the response status code should be 200
    And the response body should be an array

  @regression
  Scenario: Search is protected — non-admin gets 403
    Given I have a valid API client
    When I send a GET request to "/api/search/users" with query params:
      | q | test |
    Then the response status code should be 403

  # ─── Input validation ────────────────────────────────────────────────────────

  @regression
  Scenario: Search with empty query returns 400
    When I send a GET request to "/api/search/products" with query params:
      | q |  |
    Then the response status code should be 400

  @regression
  Scenario: Search query is sanitised against XSS
    When I send a GET request to "/api/search/products" with query params:
      | q | <script>alert(1)</script> |
    Then the response status code should be 200
    And the response body should be an array

  @regression
  Scenario: Search performance under load
    When I send a GET request to "/api/search/products" with query params:
      | q | a |
    Then the response status code should be 200
    And the response time should be less than 1500 milliseconds
