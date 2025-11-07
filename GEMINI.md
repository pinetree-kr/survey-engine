# Histree Survey Engine

## Project Overview

This project is a Typeform-like survey engine designed to be type-safe and testable. It is built with TypeScript and can be used in both Node.js and Next.js environments. The engine provides a set of utilities to create, validate, and render surveys with complex logic, including conditional branching and answer validation.

The frontend is a Next.js application that serves as a demonstration and builder for the survey engine. It uses a modern UI stack, including Radix UI components, Tailwind CSS, and Lucide icons.

**Key Technologies:**

*   **Language:** TypeScript
*   **Framework:** Next.js
*   **UI Components:** Radix UI, shadcn/ui
*   **Styling:** Tailwind CSS
*   **Schema Validation:** Zod
*   **Testing:** Vitest

## Building and Running

### Prerequisites

*   Node.js
*   npm (or a compatible package manager)

### Installation

Install the project dependencies:

```bash
npm install
```

### Running the Development Server

To start the Next.js development server with Turbopack:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build of the Next.js application:

```bash
npm run build
```

To build the library files:
```bash
npm run build:lib
```

### Running Tests

To run the test suite once:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Development Conventions

*   **Type Safety:** The project heavily emphasizes TypeScript for type safety. Zod is used for runtime validation of data structures like survey questions.
*   **Component-Based UI:** The frontend is built with React and follows a component-based architecture. Reusable UI components are located in `src/components/ui`.
*   **Styling:** Utility-first CSS with Tailwind CSS is the standard. `clsx` and `tailwind-merge` are used for constructing class names.
*   **Testing:** Unit and integration tests are written with Vitest. Test files are co-located with the source files they test (e.g., `*.spec.ts`).
*   **Code Structure:**
    *   `src/app`: Contains the Next.js pages and layouts.
    *   `src/components`: Contains the React components.
    *   `src/engine`: Contains the core survey engine logic.
    *   `src/schema`: Contains the Zod schemas for the survey data structures.
