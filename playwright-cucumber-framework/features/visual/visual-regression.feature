@visual @regression
Feature: Visual Regression Testing
  As a QA engineer
  I want to detect unexpected visual changes
  So that UI regressions are caught before they reach users

  Background:
    Given I am logged in as "standard_user"

  @smoke @visual
  Scenario: Login page matches visual baseline
    Given I navigate to "/login"
    Then the page should visually match the baseline "login-page"

  @visual @regression
  Scenario: Dashboard matches visual baseline
    Given I navigate to "/dashboard"
    Then the page should visually match the baseline "dashboard-page"

  @visual @regression
  Scenario: Products page matches visual baseline
    Given I navigate to "/products"
    Then the page should visually match the baseline "products-page"

  @visual @regression
  Scenario: Mobile viewport renders correctly
    Given I navigate to "/"
    When I set viewport to mobile
    Then the page should visually match the baseline "homepage-mobile"

  @visual @regression
  Scenario: Tablet viewport renders correctly
    Given I navigate to "/"
    When I set viewport to tablet
    Then the page should visually match the baseline "homepage-tablet"

  @visual @regression
  Scenario: AI validates visual snapshot for hidden issues
    Given I navigate to "/dashboard"
    When I analyze the current page screenshot for "layout shifts, broken images, misaligned elements, overflow"
    Then the AI analysis should have no critical issues
