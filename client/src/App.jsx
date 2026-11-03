import { useEffect, useMemo, useState } from 'react';

const api = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || 'Request failed');
  return response.status === 204 ? null : response.json();
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/todos').then(setTodos).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const visibleTodos = useMemo(() => todos.filter((todo) => filter === 'all' || (filter === 'active' ? !todo.completed : todo.completed)), [todos, filter]);
  const remaining = todos.filter((todo) => !todo.completed).length;

  async function addTodo(event) {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      const todo = await api('/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
      setTodos((current) => [todo, ...current]); setTitle('');
    } catch (e) { setError(e.message); }
  }
  async function toggle(todo) {
    try { const updated = await api(`/api/todos/${todo._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !todo.completed }) }); setTodos((items) => items.map((item) => item._id === todo._id ? updated : item)); }
    catch (e) { setError(e.message); }
  }
  async function remove(id) {
    try { await api(`/api/todos/${id}`, { method: 'DELETE' }); setTodos((items) => items.filter((item) => item._id !== id)); }
    catch (e) { setError(e.message); }
  }

  return <main className="app-shell">
    <section className="hero"><p className="eyebrow">ATLAS TODO</p><h1>Keep the day<br />delightfully clear.</h1><p className="subhead">One calm place for everything that needs your attention.</p></section>
    <section className="card">
      <form onSubmit={addTodo} className="add-form"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength="160" placeholder="What needs doing?" aria-label="New todo" /><button aria-label="Add todo">+</button></form>
      <div className="toolbar"><span>{remaining} {remaining === 1 ? 'task' : 'tasks'} left</span><div className="filters">{['all', 'active', 'completed'].map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
      {error && <p className="error" role="alert">{error}</p>}
      <ul className="todos">{loading ? <li className="empty">Loading your list…</li> : visibleTodos.length ? visibleTodos.map((todo) => <li key={todo._id} className={todo.completed ? 'done' : ''}><button className="check" onClick={() => toggle(todo)} aria-label={`Mark ${todo.title} as ${todo.completed ? 'active' : 'complete'}`}>{todo.completed && '✓'}</button><span>{todo.title}</span><button className="delete" onClick={() => remove(todo._id)} aria-label={`Delete ${todo.title}`}>×</button></li>) : <li className="empty">Nothing here yet. Add a small win.</li>}</ul>
    </section>
  </main>;
}
