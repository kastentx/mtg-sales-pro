# MTG Sales Pro

A web application for managing Magic: The Gathering card inventory, pricing, and sales integration with eBay.

## Project Overview

MTG Sales Pro is a comprehensive tool designed to help Magic: The Gathering collectors and sellers manage their inventory. The application allows users to:

- Catalog Magic: The Gathering cards with detailed information
- Validate and augment card information using third-party APIs
- Import and export card data to/from Google Sheets and XLSX formats
- Retrieve and analyze current market prices for cards
- Sort and filter inventory based on various card attributes and market data
- List cards directly on eBay through API integration
- Monitor active listings and sales history

## Development Phases

### Phase 1: Inventory Management System

Build the core functionality to catalog cards and manage basic inventory.

**Todo Items:**

- [ ] Set up project structure and basic React components
- [ ] Design database schema for card inventory
- [ ] Create card entry form with basic fields (name, set, condition, etc.)
- [ ] Research and integrate a Magic card API (Scryfall, MTGJSON, etc.)
- [ ] Implement card validation and auto-completion using the API
- [ ] Develop card detail view with all relevant information
- [ ] Create inventory list view with basic sorting and filtering
- [ ] Implement local storage solution to persist data temporarily

### Phase 2: Data Import/Export

Add functionality to save and load inventory data in various formats.

**Todo Items:**

- [ ] Implement export to XLSX functionality
- [ ] Implement import from XLSX functionality
- [ ] Research and implement Google Sheets API integration
- [ ] Create export to Google Sheets functionality
- [ ] Create import from Google Sheets functionality
- [ ] Add data validation for imported files
- [ ] Design UI for import/export options
- [ ] Implement error handling for import/export operations

### Phase 3: Price Data Integration

Integrate pricing APIs and enhance filtering and sorting capabilities.

**Todo Items:**

- [ ] Research pricing APIs (TCGPlayer, CardKingdom, MTGGoldfish, etc.)
- [ ] Implement API integration for price data retrieval
- [ ] Create price history tracking functionality
- [ ] Develop UI to display pricing information for individual cards
- [ ] Add batch price update functionality
- [ ] Enhance filtering capabilities based on price data
- [ ] Implement advanced sorting options (price trending, profit margin, etc.)
- [ ] Create simple analytics dashboard for price trends

### Phase 4: eBay Integration

Connect with eBay's API for direct listing and sales management.

**Todo Items:**

- [ ] Research eBay API requirements and authentication
- [ ] Implement eBay account authentication
- [ ] Create listing template for Magic cards
- [ ] Develop UI for creating and editing eBay listings
- [ ] Implement batch listing functionality
- [ ] Add listing status monitoring
- [ ] Create sold item tracking
- [ ] Implement revenue and profit calculations

### Phase 5: Sales Dashboard

Enhance the application with comprehensive sales analytics and reporting.

**Todo Items:**

- [ ] Design dashboard UI for sales overview
- [ ] Implement sales history tracking
- [ ] Create performance metrics (sell-through rate, profit margins, etc.)
- [ ] Add inventory valuation tools
- [ ] Develop custom reporting functionality
- [ ] Implement data visualization for sales trends
- [ ] Create inventory restock recommendations based on sales data
- [ ] Add user-configurable dashboard widgets

## Technical Stack

- **Frontend**: React with TypeScript
- **State Management**: To be determined (Redux, Context API, etc.)
- **Data Storage**: To be determined (Firebase, local storage, etc.)
- **APIs**:
  - Card data: Scryfall/MTGJSON (tentative)
  - Pricing: TCGPlayer/MTGGoldfish (tentative)
  - E-commerce: eBay API
  - Spreadsheets: Google Sheets API

## Getting Started

Instructions for setting up the development environment and running the application will be added as the project progresses.
