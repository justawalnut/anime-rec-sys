# Anime Recommendation System - Frontend

This is the frontend for the Anime Recommendation System, built with React, TypeScript, and Material-UI.

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later) or yarn

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anime_rec_sys/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following content:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts
├── pages/            # Page components
├── services/         # API services
├── types/            # TypeScript type definitions
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Features

- User authentication (login/register)
- Browse and search anime
- View anime details
- Add anime to watchlist
- Rate and review anime
- Personalized recommendations
- User profile management

## Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material-UI](https://mui.com/)
- [React Router](https://reactrouter.com/)
- [React Query](https://tanstack.com/query/)
- [Vite](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/)

## License

MIT
