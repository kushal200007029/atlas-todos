import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Todo from './models/Todo.js';

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD && process.env.MONGODB_HOST
  ? `mongodb://${encodeURIComponent(process.env.MONGODB_USERNAME)}:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@${process.env.MONGODB_HOST}:27017/${process.env.MONGODB_DATABASE || 'todo'}?authSource=admin`
  : undefined);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/todos', async (_req, res, next) => {
  try { res.json(await Todo.find().sort({ completed: 1, createdAt: -1 })); } catch (error) { next(error); }
});

app.post('/api/todos', async (req, res, next) => {
  try {
    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ message: 'A todo title is required.' });
    res.status(201).json(await Todo.create({ title }));
  } catch (error) { next(error); }
});

app.patch('/api/todos/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (typeof req.body.completed === 'boolean') updates.completed = req.body.completed;
    if (typeof req.body.title === 'string' && req.body.title.trim()) updates.title = req.body.title.trim();
    const todo = await Todo.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!todo) return res.status(404).json({ message: 'Todo not found.' });
    res.json(todo);
  } catch (error) { next(error); }
});

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.name === 'CastError' ? 400 : 500;
  res.status(status).json({ message: status === 400 ? 'Invalid todo id.' : 'Something went wrong.' });
});

if (!mongoUri) {
  console.error('Missing MongoDB configuration. Set MONGODB_URI or MONGODB_USERNAME, MONGODB_PASSWORD, and MONGODB_HOST.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
