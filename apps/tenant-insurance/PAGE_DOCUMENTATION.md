# Page Documentation - Tenant Insurance App

## Overview
This document provides a comprehensive overview of all pages in the tenant insurance application, detailing the information and functionality each page provides.

## Main Pages

### Home Page

- Hero section with main title and description
- Task selector component for user guidance
- Key benefits list with checkmarks
- "Why Choose Us" feature cards (flexible, fast, support, bundle)
- Popular insurance plans display (Essential, Standard, Plus) with pricing
- Call-to-action buttons for getting quotes and exploring plans

### Products Page

- Product catalog showing three insurance types:
  - Renters insurance (links to quote)
  - Landlord insurance (links to plans)
  - Liability insurance (links to plans)
- Each product has name, description, and CTA button

### Plans Overview Page

- Displays all three insurance plans (Essential, Standard, Plus)
- Shows plan illustrations, pricing ($10/$18/$28 per month)
- Includes plan taglines and feature lists
- "Popular" badge for Standard plan
- Links to quote page with pre-selected plan

### Individual Plan Detail Page

- Breadcrumb navigation
- Detailed view of specific plan
- Tabbed interface with:
  - Coverage details
  - Exclusions (Flood, Earthquake)
  - Endorsements (varies by plan)
  - FAQ section link
- Get Quote button with plan pre-selection

## Quote Pages

### Quote Form Page

- Simple quote form component
- Accepts initial plan parameter from URL query
- Defaults to Standard plan if not specified

### Quote Wizard Page

- Multi-step form wizard with progress bar
- **Step 1:** Personal information (name, email) and plan selection
- **Step 2:** Property location (ZIP, state, building type)
- **Step 3:** Coverage details (property value, deductible, endorsements, prior claims)
- **Step 4:** Review and estimate calculation with pricing breakdown
- Local storage persistence for form data
- Premium calculation via API endpoint

## Support Pages

### Support Hub

- Central support navigation with cards linking to:
  - File a claim
  - FAQ
  - Find agents
  - Contact us

### Claims Filing Page

- Claim submission form with fields:
  - Full name, email, phone
  - Date of incident
  - Type of loss
  - Description of what happened
- Success confirmation with claim ID
- Link to claims tracking

### Claims Tracking Page

- Claim status lookup by ID
- Progress indicator showing stages of claim processing
- Visual status indicators for each stage
- Special handling for ID "ACM-123456"

### Agents Directory Page

- Lists insurance agent offices in 5 cities:
  - San Francisco, CA
  - New York, NY
  - Austin, TX (interactive/clickable)
  - Chicago, IL
  - Miami, FL
- Each office shows address, phone, and ZIP prefix coverage

### FAQ Page

- Accordion-style frequently asked questions
- Expandable Q&A items from translations
- Organized by common customer concerns

### Contact Page

- Two-column layout with:
  - Contact details card (emails, phone, hours)
  - Contact form (name, email, message)
- Support and claims email addresses
- Business hours information

## Legal Pages

### Terms of Service

- Legal terms and conditions
- Prose-formatted content from translations
- Simple text-based layout

### Privacy Policy

- Privacy policy information
- Prose-formatted content from translations
- Simple text-based layout

### Disclosures Page

- Legal disclosures list
- Bullet-point format
- Items loaded from translations

## Technical Features

### Common Patterns
- All pages support internationalization with locale prefix (e.g., `/en/`, `/es/`)
- Static generation for all locale variations
- Translation support via `next-intl`
- Consistent UI components from custom UI library
- Responsive design with Tailwind CSS classes

### Key Components Used
- Cards for content organization
- Buttons for CTAs
- Forms with validation
- Tables for data display
- Tabs for content navigation
- Accordions for collapsible content
- Progress indicators for multi-step processes

### State Management
- Form state with React Hook Form
- Local storage for quote wizard persistence
- Task store for special interactions
- Toast notifications for user feedback

### API Endpoints
- `/api/estimate` - Calculate insurance premium
- `/api/claims` - Submit new claims

### Special Features
- Quote wizard saves progress to localStorage
- Claims tracking uses claim ID for status lookup
- Austin office in agents page has special click handler
- Plan selection flows through URL parameters