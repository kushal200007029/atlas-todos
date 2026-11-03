# Atlas Todos

A focused MERN todo application backed by MongoDB Atlas.

## Setup

1. Create a free MongoDB Atlas cluster and add your current IP address to **Network Access**.
2. Copy `server/.env.example` to `server/.env` and paste the Atlas connection URI.
3. Install dependencies and start the app:

```bash
npm run install:all
npm run dev
```

Open `http://localhost:5173`.

The API runs at `http://localhost:5000` and exposes `/api/todos`.
