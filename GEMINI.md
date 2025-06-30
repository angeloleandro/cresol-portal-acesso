# Gemini Documentation
USE SEMPRE O MODELO gemini-2.5-pro, nunca deve trocar o modelo.
This document provides a brief overview of the project, its structure, and conventions to be used by the Gemini assistant.

## Project Overview

This is a web application built with Next.js and TypeScript. It serves as a portal for Cresol, likely for employees or members, providing access to various internal systems, news, events, and other resources. The application features a main dashboard, user authentication, and an admin panel for managing content and users.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (v14)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Authentication & Database:** [Supabase](https://supabase.io/)
- **UI Components:** [React](https://reactjs.org/), [Lucide React](https://lucide.dev/guide/packages/lucide-react) for icons.

## Project Structure

The project follows the standard Next.js `app` directory structure.

- `app/`: Contains all the application's routes and UI components.
  - `api/`: API routes for handling backend logic.
  - `components/`: Shared React components used throughout the application.
  - `(pages)/`: Different pages of the application, organized by route.
- `lib/`: Utility functions, including Supabase client configuration and authentication helpers.
- `public/`: Static assets like images and icons.
- `supabase/`: Supabase-related configurations, including database migrations and functions.

## Development Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase for errors and style issues.

## Conventions

- **Styling:** Use Tailwind CSS for all styling.
- **Components:** Create reusable components and place them in the `app/components` directory.
- **State Management:** For client-side state, use React hooks. For server-side state, use Supabase.
- **Authentication:** Use the Supabase client from `lib/supabase.ts` for all interactions with the database and authentication.
- **API Routes:** All backend logic should be placed in API routes within the `app/api` directory.
- **Linting:** Before committing any changes, run `npm run lint` to ensure code quality.

USE SEMPRE O MODELO gemini-2.5-pro