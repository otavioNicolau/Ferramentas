# Copilot Instructions for UtilidadeWeb

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js project called "UtilidadeWeb" that provides free online tools for everyday tasks. The project uses:
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS for styling
- Lucide React for icons

## Code Style Guidelines
- Use TypeScript for all components and pages
- Follow React best practices with functional components and hooks
- Use Tailwind CSS classes for styling
- Implement responsive design for mobile and desktop
- Use semantic HTML elements
- Add proper TypeScript types for all props and functions

## Component Structure
- Keep components small and focused on a single responsibility
- Use proper naming conventions (PascalCase for components, camelCase for functions)
- Add loading states and error handling where appropriate
- Include accessibility features (ARIA labels, keyboard navigation)

## File Organization
- Components go in `src/components/`
- Pages use App Router structure in `src/app/`
- Types should be defined in appropriate files or `src/types/`
- Utilities go in `src/lib/` or `src/utils/`

## Tool Pages Structure
Each tool page should include:
- Clear title and description
- Input/upload sections with proper validation
- Processing/loading states
- Results display area
- Error handling with user-friendly messages
- Responsive design for all screen sizes
