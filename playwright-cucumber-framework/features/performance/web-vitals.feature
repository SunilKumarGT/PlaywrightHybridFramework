@performance @regression
Feature: Core Web Vitals & Performance Budgets
  As a QA engineer
  I want to verify pages meet performance budgets
  So that users have a fast, responsive experience

  Background:
    Given I am logged in as "standard_user"

  @smoke @performance
  Scenario: Homepage meets fast performance budget
    Given I navigate to "/"
    When I measure the performance of the current page
    Then the page should meet the "normal" performance budget

  @performance @regression
  Scenario: Login page FCP is within budget
    Given I navigate to "/login"
    When I measure the performance of the current page
    Then the First Contentful Paint should be under 2500 milliseconds
    And the page load time should be under 5000 milliseconds

  @performance @regression
  Scenario: Dashboard loads within normal budget
    Given I navigate to "/dashboard"
    When I measure the performance of the current page
    Then the page should meet the "normal" performance budget

  @performance @regression
  Scenario: Products page meets heavy budget
    Given I navigate to "/products"
    When I measure the performance of the current page
    Then the page should meet the "heavy" performance budget

  @performance @regression
  Scenario: Performance is acceptable under mock slow network
    Given the API endpoint "/api/products" is slow by 1000 milliseconds
    And I navigate to "/products"
    When I measure the performance of the current page
    Then the page load time should be under 10000 milliseconds

  @performance @regression
  Scenario: Search results load quickly
    Given I am on the products page
    When I search for "laptop"
    And I measure the performance of the current page
    Then the page load time should be under 4000 milliseconds
