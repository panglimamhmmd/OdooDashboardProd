# Odoo Projects - Next.js Integration

A Next.js 14 application that integrates with Odoo's JSON-RPC API to fetch and display project data.

## Features

- **API Integration**: Seamless connection to Odoo JSON-RPC endpoint
- **Secure Configuration**: Environment variables for API key management
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Skeleton loading for better user experience

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Odoo API key:
   ```
   ODOO_API_KEY=your_actual_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Configuration

The application is configured to connect to:
- **Odoo Instance**: `erbe-trial5.odoo.com`
- **Database**: `erbe-trial5`
- **User ID**: `2`
- **Model**: `project.project`

## Deployment

This project is ready for deployment on Vercel:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add the `ODOO_API_KEY` environment variable in your Vercel project settings
4. Deploy!

## API Endpoints

### GET `/api/projects`

Fetches projects from Odoo using JSON-RPC.

**Response Format:**
```json
{
  "success": true,
  "projects": [
    {
      "id": 1,
      "name": "Project Name"
    }
  ]
}
```

## Environment Variables

- `ODOO_API_KEY`: Your Odoo API key (required)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons