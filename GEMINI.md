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

## Codebase Analysis

### Summary of Findings

This project is a sophisticated survey builder named 'Grida, Form', built on a modern tech stack: Next.js, TypeScript, Supabase, and Tailwind CSS.

The architecture is centered around a complex client-side form builder (`src/components/FormBuilder.tsx`). This builder provides a three-panel interface (question list, main canvas, inspector panel) and supports advanced features like multi-section forms, drag-and-drop reordering, and branching logic visualization. Application state, specifically the survey draft, is managed within the `FormBuilder` component and persisted to a browser cookie.

The application uses Next.js route groups to separate authenticated routes (`(main)`) from others. A main layout (`src/app/(main)/layout.tsx`) protects these routes and sets up a consistent dashboard UI with a sidebar and header.

**Crucially, the investigation did not cover the data schemas (`src/types`, `src/schema`), the core survey logic (`src/engine`), or the database schema (`supabase/migrations`).** A full understanding of the data model, validation rules, and the runtime engine that executes the survey's logic is missing. The current findings are heavily skewed towards the client-side architecture of the builder feature.

### Relevant Locations

*   **`src/app/builder/page.tsx`**: This is the server component entry point for the form builder. It's responsible for loading the initial survey data from a server-side cookie and passing it to the main client component.
*   **`src/components/FormBuilder.tsx`**: This is the core, stateful client component for the entire survey building experience. It manages the survey's state, handles all user interactions (adding/editing/deleting questions and sections), and orchestrates the various UI panels and modals. Understanding this file is key to understanding the builder feature.
*   **`src/app/(main)/layout.tsx`**: This layout acts as the gatekeeper for the main authenticated part of the application. It verifies user authentication and fetches initial data (like user projects) before rendering the main UI shell.
*   **`src/components/layout/MainLayout.tsx`**: This component defines the primary visual structure for authenticated users, consisting of a persistent sidebar and a main content area with a header. It's the shell within which all main application pages are rendered.
*   **`src/types/survey.ts`**: (Investigation Incomplete) This file is expected to define the core data structures for the survey. Its analysis is crucial for understanding the application's data model, but was not completed.
*   **`src/engine/visibility.ts`**: (Investigation Incomplete) The `src/engine` directory appears to contain the core business logic for how a survey functions when being taken by a user. This file likely handles the logic for conditional question visibility based on previous answers. Its analysis is critical for a complete architectural understanding.
