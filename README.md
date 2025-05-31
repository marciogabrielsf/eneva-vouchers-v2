# Eneva Vouchers App

A mobile application for managing taxi driver finances through vouchers.

## Features

- Track earnings and expenses
- Manage vouchers (add, edit, delete)
- View statistics by category
- Monthly date selection
- Simple and intuitive UI

## Technical Stack

- React Native / Expo
- TypeScript
- React Navigation
- @tanstack/react-query
- Context API for state management

## Getting Started

### Prerequisites

- Node.js
- Yarn or npm
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn start
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/             # Context API for state management
├── mockData/            # Mock data for testing
├── navigation/          # Navigation configuration
├── screens/             # Application screens
├── theme/               # Theme configuration
└── types/               # TypeScript type definitions
```

## Voucher Structure

Vouchers have the following structure:

- `taxNumber`: Unique tax number (e.g., TAX-000058)
- `requestCode`: Request code with category prefix (e.g., MAN-000063)
- `date`: Date of the voucher
- `value`: Monetary value
- `start`: Starting location
- `destination`: Destination location

## Future Improvements

- Implement server connection for data persistence
- Add authentication
- Implement CSV export/import functionality
- Add charts for better statistics visualization 