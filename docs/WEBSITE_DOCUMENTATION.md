# Padel Court Booking Website - Complete Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Entity Relationship Diagram (ERD)](#3-entity-relationship-diagram-erd)
4. [User Roles and Permissions](#4-user-roles-and-permissions)
5. [Use Cases](#5-use-cases)
6. [User Stories](#6-user-stories)
7. [Storyboard / User Flow](#7-storyboard--user-flow)
8. [Feature Documentation](#8-feature-documentation)
9. [Page Descriptions](#9-page-descriptions)
10. [API / Edge Functions](#10-api--edge-functions)
11. [Security Implementation](#11-security-implementation)
12. [Payment Integration](#12-payment-integration)
13. [Email Notification System](#13-email-notification-system)
14. [Design System](#14-design-system)
15. [Technical Stack](#15-technical-stack)

---

## 1. Project Overview

### 1.1 Purpose

A comprehensive padel court booking website designed for a single padel court facility. The system enables users to book court times, register for tournaments and training sessions, purchase products from the shop, and interact with an AI chatbot for padel rules questions.

### 1.2 Key Objectives

- Provide real-time court availability and booking
- Manage tournaments and training sessions with registration
- Offer an e-commerce shop for padel products
- Display gallery of court images
- Provide player statistics and profiles
- AI-powered chatbot for padel rules assistance

### 1.3 Target Users

- **Regular Users**: Players who want to book courts, register for events, and shop
- **Administrators**: Staff who manage bookings, events, products, and users

---

## 2. System Architecture

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Pages   │ │Components│ │  Hooks   │ │ Context  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Database │ │   Auth   │ │ Storage  │ │  Edge    │           │
│  │(Postgres)│ │          │ │ (Files)  │ │Functions │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │  Stripe  │ │  Resend  │ │          │                        │
│  │(Payments)│ │ (Emails) │ │(Chatbot) │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer                | Technology                     |
| -------------------- | ------------------------------ |
| Frontend             | React 18, TypeScript, Vite     |
| Styling              | Tailwind CSS, Shadcn/UI        |
| State Management     | TanStack Query, React Context  |
| Backend              | Supabase (PostgreSQL)          |
| Authentication       | Supabase Auth                  |
| File Storage         | Supabase Storage               |
| Serverless Functions | Supabase Edge Functions (Deno) |
| Payments             | Stripe                         |
| Email                | Resend                         |
| AI                   | Lovable AI Gateway             |
| Animations           | Framer Motion                  |

---

## 3. Entity Relationship Diagram (ERD)

### 3.1 Database Schema Diagram

```
┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │   user_roles    │
├─────────────────┤       ├─────────────────┤
│ id (PK, FK)     │◄──────│ user_id (FK)    │
│ email           │       │ role            │
│ full_name       │       │ id (PK)         │
│ phone           │       │ created_at      │
│ avatar_url      │       └─────────────────┘
│ booking_reminders│
│ tournament_reminders│
│ training_reminders│
│ created_at      │
│ updated_at      │
└─────────────────┘
        │
        │ user_id
        ▼
┌─────────────────┐       ┌─────────────────┐
│    bookings     │       │    gallery      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ image_url       │
│ booking_date    │       │ title           │
│ start_time      │       │ description     │
│ end_time        │       │ created_at      │
│ status          │       └─────────────────┘
│ privacy         │
│ recurrence      │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   tournaments   │       │tournament_      │
├─────────────────┤       │registrations    │
│ id (PK)         │◄──────├─────────────────┤
│ title           │       │ id (PK)         │
│ description     │       │ tournament_id   │
│ start_date      │       │ user_id (FK)    │
│ end_date        │       │ partner_name    │
│ image_url       │       │ entry_fee       │
│ max_participants│       │ payment_status  │
│ registration_   │       │ payment_intent_id│
│   deadline      │       │ transportation_ │
│ status          │       │   required      │
│ created_at      │       │ pickup_location │
│ updated_at      │       │ transportation_ │
└─────────────────┘       │   status        │
                          │ created_at      │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│training_sessions│       │training_        │
├─────────────────┤       │registrations    │
│ id (PK)         │◄──────├─────────────────┤
│ title           │       │ id (PK)         │
│ description     │       │ training_       │
│ session_date    │       │   session_id    │
│ start_time      │       │ user_id (FK)    │
│ end_time        │       │ payment_status  │
│ price           │       │ payment_intent_id│
│ image_url       │       │ transportation_ │
│ max_participants│       │   required      │
│ status          │       │ pickup_location │
│ created_at      │       │ transportation_ │
│ updated_at      │       │   status        │
└─────────────────┘       │ created_at      │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    products     │       │     orders      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ user_id (FK)    │
│ description     │       │ total_amount    │
│ price           │       │ status          │
│ image_url       │       │ payment_status  │
│ category        │       │ payment_intent_id│
│ stock           │       │ delivery_required│
│ status          │       │ delivery_address│
│ created_at      │       │ delivery_status │
│ updated_at      │       │ delivery_notes  │
└─────────────────┘       │ created_at      │
        │                 │ updated_at      │
        │                 └─────────────────┘
        │                         │
        │                         │
        ▼                         ▼
┌─────────────────────────────────────────┐
│             order_items                  │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ order_id (FK) ───────────────────────────│
│ product_id (FK) ─────────────────────────│
│ quantity                                 │
│ price                                    │
│ created_at                               │
└─────────────────────────────────────────┘
```

### 3.2 Table Descriptions

| Table                    | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| profiles                 | User profile information linked to auth.users        |
| user_roles               | Role assignments (user/admin) for access control     |
| bookings                 | Court booking records with date, time, and status    |
| gallery                  | Images displayed in the gallery section              |
| tournaments              | Tournament events with details and registration info |
| tournament_registrations | User registrations for tournaments                   |
| training_sessions        | Training session events                              |
| training_registrations   | User registrations for training sessions             |
| products                 | Shop products with inventory                         |
| orders                   | Customer orders with payment and delivery info       |
| order_items              | Individual items within each order                   |

### 3.3 Enums

```sql
-- User roles
CREATE TYPE app_role AS ENUM ('user', 'admin');

-- Booking privacy levels
CREATE TYPE booking_privacy AS ENUM ('public', 'private');

-- Booking recurrence options
CREATE TYPE booking_recurrence AS ENUM ('one_time', 'weekly');
```

---

## 4. User Roles and Permissions

### 4.1 Role Hierarchy

```
┌─────────────────────────────────────────┐
│              ADMIN                       │
│  • Full system access                    │
│  • Manage all users                      │
│  • Manage all content                    │
│  • View statistics & history             │
│  • Assign roles                          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           REGISTERED USER                │
│  • Book courts                           │
│  • Register for events                   │
│  • Purchase products                     │
│  • View own profile & stats              │
│  • Use AI chatbot                        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           GUEST (Unauthenticated)        │
│  • View public pages                     │
│  • View tournaments & training           │
│  • View gallery                          │
│  • View shop products                    │
│  • Use AI chatbot                        │
└─────────────────────────────────────────┘
```

### 4.2 Permission Matrix

| Feature             | Guest | User | Admin |
| ------------------- | ----- | ---- | ----- |
| View Home Page      | ✅    | ✅   | ✅    |
| View Gallery        | ✅    | ✅   | ✅    |
| View Shop           | ✅    | ✅   | ✅    |
| View Tournaments    | ✅    | ✅   | ✅    |
| View Training       | ✅    | ✅   | ✅    |
| Use AI Chatbot      | ✅    | ✅   | ✅    |
| Book Court          | ❌    | ✅   | ✅    |
| Register for Events | ❌    | ✅   | ✅    |
| Purchase Products   | ❌    | ✅   | ✅    |
| View Own Profile    | ❌    | ✅   | ✅    |
| View Statistics     | ❌    | ✅   | ✅    |
| Admin Dashboard     | ❌    | ❌   | ✅    |
| Manage Users        | ❌    | ❌   | ✅    |
| Manage Bookings     | ❌    | ❌   | ✅    |
| Manage Products     | ❌    | ❌   | ✅    |
| Manage Events       | ❌    | ❌   | ✅    |
| View System Stats   | ❌    | ❌   | ✅    |
| View History        | ❌    | ❌   | ✅    |

---

## 5. Use Cases

### 5.1 Use Case Diagram

```
                    ┌─────────────────────────────────────────┐
                    │           Padel Court System            │
                    │                                         │
    ┌───────┐       │  ┌─────────────────────────────────┐   │
    │ Guest │───────│──│ UC01: View Public Information   │   │
    └───────┘       │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │           │──│ UC02: Use AI Chatbot            │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        └───────────│──│ UC03: Register Account          │   │
                    │  └─────────────────────────────────┘   │
    ┌───────┐       │  ┌─────────────────────────────────┐   │
    │ User  │───────│──│ UC04: Book Court                │   │
    └───────┘       │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC05: Register for Tournament   │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC06: Register for Training     │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC07: Purchase Products         │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC08: Manage Profile            │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        └───────────│──│ UC09: View Statistics           │   │
                    │  └─────────────────────────────────┘   │
    ┌───────┐       │  ┌─────────────────────────────────┐   │
    │ Admin │───────│──│ UC10: Manage Bookings           │   │
    └───────┘       │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC11: Manage Tournaments        │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC12: Manage Training Sessions  │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC13: Manage Products           │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC14: Manage Users & Roles      │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC15: Manage Gallery            │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        │───────────│──│ UC16: View Statistics & History │   │
        │           │  └─────────────────────────────────┘   │
        │           │  ┌─────────────────────────────────┐   │
        └───────────│──│ UC17: Manage Delivery/Transport │   │
                    │  └─────────────────────────────────┘   │
                    └─────────────────────────────────────────┘
```

### 5.2 Detailed Use Cases

#### UC01: View Public Information

| Field             | Description                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| **Actor**         | Guest, User, Admin                                                                                             |
| **Description**   | View publicly available information on the website                                                             |
| **Precondition**  | None                                                                                                           |
| **Main Flow**     | 1. User navigates to the website<br>2. User views home page, gallery, tournaments, training, shop, about pages |
| **Postcondition** | User has viewed the requested information                                                                      |

#### UC04: Book Court

| Field                | Description                                                                                                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Actor**            | Registered User                                                                                                                                                                                                                                                                                                    |
| **Description**      | Book a padel court for a specific date and time                                                                                                                                                                                                                                                                    |
| **Precondition**     | User is logged in                                                                                                                                                                                                                                                                                                  |
| **Main Flow**        | 1. User navigates to Bookings page<br>2. User selects a date<br>3. System displays available time slots<br>4. User selects a time slot<br>5. User chooses privacy (public/private)<br>6. User chooses recurrence (one-time/weekly)<br>7. User confirms booking<br>8. System creates booking and sends confirmation |
| **Alternative Flow** | 4a. Selected time slot is unavailable - User selects different slot                                                                                                                                                                                                                                                |
| **Postcondition**    | Booking is created and visible in real-time                                                                                                                                                                                                                                                                        |

#### UC05: Register for Tournament

| Field                | Description                                                                                                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actor**            | Registered User                                                                                                                                                                                                                                    |
| **Description**      | Register for an upcoming tournament                                                                                                                                                                                                                |
| **Precondition**     | User is logged in, Tournament is open for registration                                                                                                                                                                                             |
| **Main Flow**        | 1. User navigates to Tournaments page<br>2. User selects a tournament<br>3. User enters partner name (if required)<br>4. User optionally requests transportation<br>5. User optionally pays entry fee via Stripe<br>6. System creates registration |
| **Alternative Flow** | 5a. User chooses to pay at event                                                                                                                                                                                                                   |
| **Postcondition**    | User is registered for tournament                                                                                                                                                                                                                  |

#### UC07: Purchase Products

| Field                | Description                                                                                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actor**            | Registered User                                                                                                                                                                                                                                         |
| **Description**      | Purchase products from the shop                                                                                                                                                                                                                         |
| **Precondition**     | User is logged in                                                                                                                                                                                                                                       |
| **Main Flow**        | 1. User navigates to Shop page<br>2. User browses products<br>3. User adds items to cart<br>4. User views cart<br>5. User optionally requests delivery<br>6. User proceeds to checkout<br>7. User optionally pays via Stripe<br>8. System creates order |
| **Alternative Flow** | 3a. Item out of stock - Cannot add more than available<br>7a. User chooses pay on delivery                                                                                                                                                              |
| **Postcondition**    | Order is created                                                                                                                                                                                                                                        |

#### UC10: Manage Bookings (Admin)

| Field             | Description                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actor**         | Admin                                                                                                                                           |
| **Description**   | View and manage all court bookings                                                                                                              |
| **Precondition**  | Admin is logged in                                                                                                                              |
| **Main Flow**     | 1. Admin navigates to Admin Dashboard<br>2. Admin selects Bookings tab<br>3. Admin views all bookings<br>4. Admin can delete or modify bookings |
| **Postcondition** | Bookings are updated                                                                                                                            |

---

## 6. User Stories

### 6.1 Guest User Stories

| ID     | User Story                                                                    | Acceptance Criteria                                              |
| ------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| US-G01 | As a guest, I want to view the home page so I can learn about the padel court | Home page displays court information, images, and call-to-action |
| US-G02 | As a guest, I want to view the gallery so I can see the facilities            | Gallery displays all uploaded images                             |
| US-G03 | As a guest, I want to view tournaments so I can see upcoming events           | Tournament list shows all upcoming tournaments with details      |
| US-G04 | As a guest, I want to use the AI chatbot so I can learn padel rules           | Chatbot responds to padel-related questions                      |
| US-G05 | As a guest, I want to register an account so I can book courts                | Registration form creates new user account                       |

### 6.2 Registered User Stories

| ID     | User Story                                                             | Acceptance Criteria                            |
| ------ | ---------------------------------------------------------------------- | ---------------------------------------------- |
| US-U01 | As a user, I want to book a court so I can play padel                  | Booking is created with selected date/time     |
| US-U02 | As a user, I want to see real-time availability so I don't double-book | Available slots update in real-time            |
| US-U03 | As a user, I want to register for tournaments so I can compete         | Registration is recorded with optional payment |
| US-U04 | As a user, I want to register for training so I can improve            | Training registration is created               |
| US-U05 | As a user, I want to purchase products so I can get equipment          | Order is created with items                    |
| US-U06 | As a user, I want to request delivery so products come to me           | Order includes delivery address                |
| US-U07 | As a user, I want to request transportation so I can get to events     | Registration includes pickup location          |
| US-U08 | As a user, I want to view my profile so I can see my information       | Profile page shows user data and stats         |
| US-U09 | As a user, I want to receive reminders so I don't miss bookings        | Email reminders are sent before events         |
| US-U10 | As a user, I want to cancel my booking so I can free up the slot       | Booking is deleted and slot becomes available  |

### 6.3 Admin User Stories

| ID     | User Story                                                                  | Acceptance Criteria                      |
| ------ | --------------------------------------------------------------------------- | ---------------------------------------- |
| US-A01 | As an admin, I want to view all bookings so I can manage the court          | All bookings are displayed with details  |
| US-A02 | As an admin, I want to create tournaments so users can register             | Tournament is created and visible        |
| US-A03 | As an admin, I want to create training sessions so users can learn          | Training session is created              |
| US-A04 | As an admin, I want to manage products so the shop is updated               | Products can be added/edited/deleted     |
| US-A05 | As an admin, I want to manage users so I can control access                 | User list with role management           |
| US-A06 | As an admin, I want to upload gallery images so users can see facilities    | Images are uploaded and displayed        |
| US-A07 | As an admin, I want to view statistics so I can track business              | Stats show bookings, orders, revenue     |
| US-A08 | As an admin, I want to view delivery requests so I can fulfill orders       | Delivery orders are listed with details  |
| US-A09 | As an admin, I want to view transportation requests so I can arrange pickup | Transport requests are listed            |
| US-A10 | As an admin, I want to view history so I can see completed items            | Archive shows past deliveries/transports |

---

## 7. Storyboard / User Flow

### 7.1 Guest to User Registration Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Landing    │────▶│   Sign Up   │────▶│   Email     │────▶│  Dashboard  │
│    Page     │     │    Form     │     │Confirmation │     │   (Home)    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                                        │
      │                   │                                        │
      ▼                   ▼                                        ▼
┌─────────────┐     ┌─────────────┐                         ┌─────────────┐
│   Sign In   │◀────│   Error     │                         │   Profile   │
│    Form     │     │  (Invalid)  │                         │    Setup    │
└─────────────┘     └─────────────┘                         └─────────────┘
```

### 7.2 Court Booking Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Bookings   │────▶│   Select    │────▶│   Select    │────▶│   Choose    │
│    Page     │     │    Date     │     │    Time     │     │   Options   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                              │                    │
                                              │                    │
                                              ▼                    ▼
                                        ┌─────────────┐     ┌─────────────┐
                                        │   Slot      │     │  Confirm    │
                                        │ Unavailable │     │   Booking   │
                                        └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │   Success   │
                                                            │   Message   │
                                                            └─────────────┘
```

### 7.3 Shop Purchase Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Shop     │────▶│   Product   │────▶│    Cart     │────▶│  Checkout   │
│    Page     │     │   Details   │     │    View     │     │   Options   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │                    │
      │                   │                    │                    │
      ▼                   ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Category   │     │  Add to     │     │   Update    │     │  Delivery   │
│   Filter    │     │   Cart      │     │  Quantity   │     │   Address   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                              ┌────────────────────┼────────────────────┐
                                              ▼                    ▼                    ▼
                                        ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                                        │   Stripe    │     │   Pay on    │     │   Order     │
                                        │  Payment    │     │  Delivery   │     │  Complete   │
                                        └─────────────┘     └─────────────┘     └─────────────┘
```

### 7.4 Tournament Registration Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Tournaments │────▶│  Tournament │────▶│  Register   │────▶│   Partner   │
│    List     │     │   Details   │     │   Button    │     │    Name     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │Transportation│
                                                            │   Option    │
                                                            └─────────────┘
                                                                   │
                                              ┌────────────────────┼────────────────────┐
                                              ▼                    ▼                    ▼
                                        ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                                        │   Stripe    │     │   Pay at    │     │Registration │
                                        │  Payment    │     │   Event     │     │  Complete   │
                                        └─────────────┘     └─────────────┘     └─────────────┘
```

### 7.5 Admin Management Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────────────────┐
│   Admin     │────▶│  Dashboard  │────▶│                                         │
│   Login     │     │    Home     │     │     ┌─────────┐  ┌─────────┐           │
└─────────────┘     └─────────────┘     │     │Bookings │  │Tourney  │           │
                                        │     └─────────┘  └─────────┘           │
                                        │     ┌─────────┐  ┌─────────┐           │
                                        │     │Training │  │Products │           │
                                        │     └─────────┘  └─────────┘           │
                                        │     ┌─────────┐  ┌─────────┐           │
                                        │     │  Users  │  │  Roles  │           │
                                        │     └─────────┘  └─────────┘           │
                                        │     ┌─────────┐  ┌─────────┐           │
                                        │     │ Gallery │  │Delivery │           │
                                        │     └─────────┘  └─────────┘           │
                                        │     ┌─────────┐  ┌─────────┐           │
                                        │     │  Stats  │  │ History │           │
                                        │     └─────────┘  └─────────┘           │
                                        └─────────────────────────────────────────┘
```

---

## 8. Feature Documentation

### 8.1 Court Booking System

#### 8.1.1 Description

Real-time court booking system allowing users to reserve the padel court for specific time slots.

#### 8.1.2 Features

- **Real-time availability**: Users see live updates of booked slots
- **Date selection**: Calendar-based date picker
- **Time slots**: Hourly booking slots
- **Privacy options**: Public (visible to all) or Private bookings
- **Recurrence**: One-time or weekly recurring bookings
- **Auto-hide past bookings**: Past time slots automatically hidden

#### 8.1.3 Business Rules

- Users cannot book already reserved slots
- Past bookings are hidden from the booking interface
- Only authenticated users can create bookings
- Users can only delete their own bookings
- Admins can manage all bookings

### 8.2 Tournament System

#### 8.2.1 Description

Tournament management system for creating and managing padel tournaments.

#### 8.2.2 Features

- **Tournament creation**: Admin can create tournaments with details
- **Image upload**: Tournament images stored in Supabase Storage
- **Registration**: Users can register with partner name
- **Transportation**: Optional transportation request with pickup location
- **Payment**: Optional Stripe payment or pay at event
- **Capacity tracking**: Max participants with registration count

#### 8.2.3 Business Rules

- Registration closes at deadline
- Users cannot register multiple times
- Payment is optional (can pay at event)

### 8.3 Training Session System

#### 8.3.1 Description

Training session management for scheduling and booking training events.

#### 8.3.2 Features

- **Session creation**: Admin creates training sessions
- **Pricing**: Sessions can have associated prices
- **Registration**: Users register for sessions
- **Transportation**: Optional pickup arrangement
- **Payment**: Optional Stripe payment

### 8.4 E-commerce Shop

#### 8.4.1 Description

Online shop for padel equipment and merchandise.

#### 8.4.2 Features

- **Product catalog**: Products with images, descriptions, prices
- **Categories**: Product categorization
- **Inventory**: Stock management
- **Shopping cart**: Add/remove items, quantity control
- **Checkout**: Order creation with delivery options
- **Payment**: Stripe integration or pay on delivery

#### 8.4.3 Business Rules

- Cannot add more items than available stock
- Delivery address required if delivery selected
- Orders can be paid online or on delivery

### 8.5 AI Chatbot

#### 8.5.1 Description

AI-powered chatbot for answering padel rules questions.

#### 8.5.2 Features

- **Floating interface**: Accessible from any page
- **Padel expertise**: Trained on padel rules and regulations
- **Conversational**: Natural language interaction

### 8.6 Gallery

#### 8.6.1 Description

Image gallery showcasing the padel court and facilities.

#### 8.6.2 Features

- **Image grid**: Responsive gallery layout
- **Image upload**: Admin can upload images
- **Titles/descriptions**: Optional metadata

### 8.7 User Profile

#### 8.7.1 Description

User profile page with personal information and statistics.

#### 8.7.2 Features

- **Profile photo**: Avatar upload
- **Personal info**: Name, email, phone
- **Statistics**: Matches, tournaments, training sessions
- **Reminder preferences**: Email notification settings

### 8.8 Admin Dashboard

#### 8.8.1 Description

Comprehensive admin interface for managing all aspects of the system.

#### 8.8.2 Tabs

1. **Bookings**: View/manage all court bookings
2. **Tournaments**: Create/edit tournaments
3. **Training**: Create/edit training sessions
4. **Products**: Manage shop inventory
5. **Users**: View registered users
6. **Roles**: Assign admin roles
7. **Gallery**: Manage gallery images
8. **Delivery**: Track delivery/transport requests
9. **Stats**: Business statistics and analytics
10. **History**: Archive of completed items

---

## 9. Page Descriptions

### 9.1 Public Pages

| Page        | Route          | Description                                             |
| ----------- | -------------- | ------------------------------------------------------- |
| Home        | `/`            | Landing page with hero banner, features, call-to-action |
| About       | `/about`       | Information about the padel court facility              |
| Gallery     | `/gallery`     | Image gallery of facilities                             |
| Tournaments | `/tournaments` | List of upcoming tournaments                            |
| Training    | `/training`    | List of training sessions                               |
| Shop        | `/shop`        | Product catalog and shopping cart                       |
| Auth        | `/auth`        | Login and registration forms                            |

### 9.2 Protected Pages (Authenticated)

| Page     | Route       | Description                 |
| -------- | ----------- | --------------------------- |
| Bookings | `/bookings` | Court booking interface     |
| Profile  | `/profile`  | User profile and statistics |

### 9.3 Admin Pages

| Page            | Route    | Description                         |
| --------------- | -------- | ----------------------------------- |
| Admin Dashboard | `/admin` | Complete admin management interface |

---

## 10. API / Edge Functions

### 10.1 Edge Functions Overview

| Function                     | Purpose                         | Trigger                 |
| ---------------------------- | ------------------------------- | ----------------------- |
| `padel-chat`                 | AI chatbot responses            | User chat message       |
| `create-shop-checkout`       | Stripe checkout for shop        | Cart checkout           |
| `create-tournament-checkout` | Stripe checkout for tournaments | Tournament registration |
| `create-training-checkout`   | Stripe checkout for training    | Training registration   |
| `send-reminder-emails`       | Send booking/event reminders    | Scheduled (CRON)        |

### 10.2 Padel Chat Function

```typescript
// Endpoint: /functions/v1/padel-chat
// Method: POST
// Body: { messages: Array<{role: string, content: string}> }
// Response: Stream of AI responses
```

### 10.3 Checkout Functions

```typescript
// Endpoint: /functions/v1/create-shop-checkout
// Method: POST
// Body: { items: Array<{product_id, quantity}>, delivery_required, delivery_address }
// Response: { url: string } // Stripe checkout URL
```

---

## 11. Security Implementation

### 11.1 Authentication

- **Method**: Supabase Auth with email/password
- **Auto-confirm**: Enabled for development
- **Session**: JWT-based session management

### 11.2 Row Level Security (RLS) Policies

#### Profiles Table

```sql
-- Users can view own profile or admins can view all
POLICY: SELECT WHERE (auth.uid() = id) OR has_role(auth.uid(), 'admin')

-- Users can insert own profile
POLICY: INSERT WITH CHECK (auth.uid() = id)

-- Users can update own profile
POLICY: UPDATE USING (auth.uid() = id)
```

#### Bookings Table

```sql
-- Anyone can view bookings (for availability)
POLICY: SELECT WHERE true

-- Authenticated users can create bookings
POLICY: INSERT WITH CHECK (auth.uid() = user_id)

-- Users can update/delete own bookings
POLICY: UPDATE/DELETE USING (auth.uid() = user_id)

-- Admins can manage all bookings
POLICY: ALL USING has_role(auth.uid(), 'admin')
```

#### Products Table

```sql
-- Anyone can view active products
POLICY: SELECT WHERE true

-- Only admins can manage products
POLICY: ALL USING has_role(auth.uid(), 'admin')
```

### 11.3 Role-Based Access Control

```sql
-- Function to check user roles
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## 12. Payment Integration

### 12.1 Stripe Configuration

| Component | Value                    |
| --------- | ------------------------ |
| Provider  | Stripe                   |
| Mode      | Checkout Sessions        |
| Currency  | Configured per product   |
| Webhook   | For payment confirmation |

### 12.2 Payment Flows

#### Shop Checkout

1. User adds items to cart
2. User proceeds to checkout
3. System creates Stripe Checkout Session
4. User completes payment on Stripe
5. Webhook updates order status
6. Order marked as paid

#### Event Registration

1. User registers for event
2. User chooses to pay now
3. System creates Stripe Checkout Session
4. User completes payment
5. Registration marked as paid

### 12.3 Payment Status Values

- `pending` - Payment not yet made
- `paid` - Payment completed
- `failed` - Payment failed

---

## 13. Email Notification System

### 13.1 Email Provider

- **Service**: Resend
- **Trigger**: CRON-based edge function

### 13.2 Notification Types

| Type                | Trigger             | Content                      |
| ------------------- | ------------------- | ---------------------------- |
| Booking Reminder    | Before booking time | Booking details, date, time  |
| Tournament Reminder | Before tournament   | Tournament details, location |
| Training Reminder   | Before session      | Training details, time       |

### 13.3 User Preferences

Users can enable/disable reminders in profile:

- `booking_reminders` - Court booking reminders
- `tournament_reminders` - Tournament reminders
- `training_reminders` - Training session reminders

---

## 14. Design System

### 14.1 Brand Colors

| Name             | HSL Value           | Usage               |
| ---------------- | ------------------- | ------------------- |
| Primary (Navy)   | hsl(222, 47%, 11%)  | Headers, buttons    |
| Secondary (Lime) | hsl(84, 81%, 44%)   | Accents, highlights |
| Accent (Cyan)    | hsl(186, 100%, 42%) | Links, interactive  |
| Background       | hsl(0, 0%, 100%)    | Page background     |
| Foreground       | hsl(222, 47%, 11%)  | Text                |

### 14.2 Typography

| Element  | Font          | Weight        |
| -------- | ------------- | ------------- |
| Headings | System/Custom | Bold (700)    |
| Body     | System        | Regular (400) |
| Buttons  | System        | Medium (500)  |

### 14.3 Components

Built with Shadcn/UI component library:

- Buttons, Cards, Dialogs
- Forms, Inputs, Select
- Tables, Tabs
- Toast notifications
- Calendar, Date picker

---

## 15. Technical Stack

### 15.1 Frontend Dependencies

| Package               | Version   | Purpose        |
| --------------------- | --------- | -------------- |
| React                 | ^18.3.1   | UI Framework   |
| TypeScript            | -         | Type Safety    |
| Vite                  | -         | Build Tool     |
| Tailwind CSS          | -         | Styling        |
| @tanstack/react-query | ^5.83.0   | Data Fetching  |
| react-router-dom      | ^6.30.1   | Routing        |
| framer-motion         | ^12.23.24 | Animations     |
| lucide-react          | ^0.462.0  | Icons          |
| date-fns              | ^3.6.0    | Date Utilities |
| recharts              | ^2.15.4   | Charts         |
| zod                   | ^3.25.76  | Validation     |
| react-hook-form       | ^7.61.1   | Forms          |

### 15.2 Backend Services

| Service                 | Purpose                  |
| ----------------------- | ------------------------ |
| Supabase Database       | PostgreSQL data storage  |
| Supabase Auth           | User authentication      |
| Supabase Storage        | File/image storage       |
| Supabase Edge Functions | Serverless backend logic |
| Stripe                  | Payment processing       |
| Resend                  | Email delivery           |
|                         | AI chatbot               |

### 15.3 File Structure

```
src/
├── assets/              # Static images
├── components/
│   ├── admin/          # Admin dashboard components
│   └── ui/             # Shadcn UI components
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom hooks
├── integrations/
│   └── supabase/       # Supabase client & types
├── lib/                # Utilities
├── pages/              # Page components
│   └── admin/          # Admin pages
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles

supabase/
├── config.toml         # Supabase configuration
└── functions/          # Edge functions
    ├── padel-chat/
    ├── create-shop-checkout/
    ├── create-tournament-checkout/
    ├── create-training-checkout/
    └── send-reminder-emails/
```

---

## Appendix A: Glossary

| Term          | Definition                                   |
| ------------- | -------------------------------------------- |
| Padel         | A racquet sport combining tennis and squash  |
| RLS           | Row Level Security - database access control |
| Edge Function | Serverless function running close to users   |
| JWT           | JSON Web Token - authentication token        |
| CRON          | Scheduled task execution                     |

---

## Appendix B: Version History

| Version | Date          | Changes               |
| ------- | ------------- | --------------------- |
| 1.0     | December 2025 | Initial documentation |

---

_Document generated for Padel Court Booking Website_
_Last updated: December 2025_
