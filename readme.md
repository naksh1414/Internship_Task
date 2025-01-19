# Interview Scheduling Application

A React/Vite application for managing and scheduling interviews, built with TypeScript and Tailwind CSS.

## Prerequisites

- Node.js 20.x or later
- Docker and Docker Compose (for containerized deployment)
- npm or yarn package manager

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd naksh1414-internship_task
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Docker Development Setup

To run the application using Docker for development:

```bash
docker compose up dev
```

This will start the application in development mode with hot-reload enabled.

## Production Deployment

1. Build and start the production container:
```bash
docker compose up web -d
```

The application will be available at `http://localhost:80`

2. To stop the container:
```bash
docker compose down
```

## Project Structure

```
naksh1414-internship_task/
├── src/
│   ├── components/     # Reusable React components
│   ├── lib/           # Utility functions and helpers
│   ├── pages/         # Page components
│   └── store/         # State management
├── public/            # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Environment Variables

Create a `.env` file in the root directory and add any required environment variables:

```env
VITE_API_URL=your_api_url_here
# Add other environment variables as needed
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.