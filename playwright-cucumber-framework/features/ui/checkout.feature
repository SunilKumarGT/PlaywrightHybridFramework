@ui @regression
Feature: Checkout Flow
  As a shopper with items in my cart
  I want to complete a purchase
  So that I can receive my ordered products

  Background:
    Given I am logged in as "standard_user"
    And I am on the products page
    And I add the first product to the cart
    And I am on the cart page

  @smoke
  Scenario: Complete successful checkout
    When I proceed to checkout
    And I complete checkout with default details
    Then the order should be confirmed

  @regression
  Scenario: Cannot checkout with empty cart
    When I remove item 1 from the cart
    Then the cart should be empty
    And the element "[data-testid='checkout-btn'], .checkout-btn" should be disabled

  @regression
  Scenario: Order number is displayed after checkout
    When I proceed to checkout
    And I complete checkout with default details
    Then the order should be confirmed
    And the element "[data-testid='order-number'], .order-number" should be visible

  @regression
  Scenario: Checkout requires valid shipping address
    When I proceed to checkout
    And I click the "[data-testid='place-order'], .place-order" button without filling the form
    Then I should see "required"

  @regression
  Scenario: User can apply coupon before checkout
    When I apply coupon code "SAVE10"
    Then the coupon should be applied successfully
    When I proceed to checkout
    And I complete checkout with default details
    Then the order should be confirmed
