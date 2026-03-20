@ui @regression
Feature: Product Catalogue
  As a shopper
  I want to browse, search, and filter products
  So that I can find what I want and add it to my cart

  Background:
    Given I am logged in as "standard_user"
    And I am on the products page

  @smoke
  Scenario: Products page loads with items
    Then I should see at least 1 products
    And the element "[data-testid='product-grid'], .product-grid" should be visible

  @regression
  Scenario: Search for a product
    When I search for "laptop"
    Then I should see at least 1 products

  @regression
  Scenario: Search with no results
    When I search for "xyznonexistentproduct99999"
    Then no results message should be visible

  @regression
  Scenario: Filter by category
    When I filter products by category "electronics"
    Then I should see at least 1 products

  @regression
  Scenario: Sort products by price
    When I sort products by "price_asc"
    Then products should be sorted by price ascending

  @regression
  Scenario: Filter by price range
    When I filter products by price between 10 and 100
    Then I should see at least 1 products

  @regression
  Scenario: Add a product to cart
    When I add the first product to the cart
    Then the URL should contain "cart"

  @regression
  Scenario: View product details
    When I click on the first product
    Then the URL should contain "product"
    And the element "h1, .product-title" should be visible

  @regression
  Scenario: Cart persists added items
    When I add the first product to the cart
    And I navigate to "/cart"
    Then the cart should have 1 item(s)

  @regression
  Scenario: Remove item from cart
    Given I add the first product to the cart
    And I am on the cart page
    When I remove item 1 from the cart
    Then the cart should be empty

  @regression
  Scenario: Apply valid coupon code
    Given I add the first product to the cart
    And I am on the cart page
    When I apply coupon code "SAVE10"
    Then the coupon should be applied successfully
