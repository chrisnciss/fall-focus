"use client";

import { useEffect, useMemo, useState } from "react";

const seedTasks = [
  { id: 1, title: "Finish project proposal", category: "Work", priority: "High", due: "2026-09-12", done: false },
  { id: 2, title: "Schedule fall check-in", category: "Planning", priority: "Medium", due: "2026-09-18", done: false },
  { id: 3, title: "Organize research notes", category: "Personal", priority: "Low", due: "2026-10-02", done: true },
  { id: 4, title: "Prepare quarterly review", category: "Work", priority: "High", due: "2026-10-09", done: false },
  { id: 5, title: "Plan November priorities", category: "Planning", priority: "Medium", due: "2026-10-28", done: false }
];

const Icon = ({ children, size = 18 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const Plus = () => <Icon><path d="M12 5v14M5 12h14" /></Icon>;
const Check = () => <Icon size={15}><path d="m5 12 4 4L19 6" /></Icon>;
const Trash = () => <Icon size={17}><path d="M4 7h16M10 11v6M14 11v6M9 7l1-3h4l1 3M6 7l1 14h10l1-14" /></Icon>;
const Calendar = () => <Icon size={16}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></Icon>;
const Leaf = () => <Icon size={22}><path d="M20 4C12 4 5 8 5 15c0 2 1 4 3 5 1-6 5-9 10-12-4 4-7 7-8 12 7 0 11-6 10-16Z"/></Icon>;
const Search = () => <Icon size={17}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon>;
const X = () => <Icon size={18}><path d="M6 6l12 12M18 6 6 18"/></Icon>;

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export default function Home() {
  const [tasks, setTasks] = useState(seedTasks);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Work", priority: "Medium", due: "2026-09-01" });

  useEffect(() => {
    const saved = localStorage.getItem("fall-focus-tasks");
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("fall-focus-tasks", JSON.stringify(tasks));
  }, [tasks, loaded]);

  const visible = useMemo(() => tasks.filter(task => {
    const matchesFilter = filter === "All" || (filter === "Open" && !task.done) || (filter === "Done" && task.done) || task.category === filter;
    return matchesFilter && task.title.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => Number(a.done) - Number(b.done) || new Date(a.due) - new Date(b.due)), [tasks, filter, search]);

  const done = tasks.filter(t => t.done).length;
  const open = tasks.length - done;
  const high = tasks.filter(t => !t.done && t.priority === "High").length;
  const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0;

  function addTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setTasks(prev => [{ ...form, title: form.title.trim(), id: Date.now(), done: false }, ...prev]);
    setForm({ title: "", category: "Work", priority: "Medium", due: "2026-09-01" });
    setShowForm(false);
  }

  return (
    <main>
      <header>
        <a className="brand" href="#"><span className="brand-mark"><Leaf /></span><span>Fall <i>Focus</i></span></a>
        <div className="season"><span /> FALL 2026</div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">YOUR SEASON, CLEARLY PLANNED</p>
          <h1>Make space for<br/><em>what matters.</em></h1>
          <p className="intro">A simple home for the work you want to finish this fall. One task, one week, one win at a time.</p>
        </div>
        <div className="hero-action">
          <button className="primary" onClick={() => setShowForm(true)}><Plus /> Add a task</button>
          <p>{open} open task{open !== 1 ? "s" : ""} this season</p>
        </div>
      </section>

      <section className="stats" aria-label="Task summary">
        <div><span className="stat-label">SEASON PROGRESS</span><strong>{progress}<small>%</small></strong><div className="bar"><i style={{width: `${progress}%`}} /></div></div>
        <div><span className="stat-label">OPEN TASKS</span><strong>{open}</strong><p>Still in motion</p></div>
        <div><span className="stat-label">COMPLETED</span><strong>{done}</strong><p>Wins this fall</p></div>
        <div><span className="stat-label">HIGH PRIORITY</span><strong className="rust">{high}</strong><p>Needs attention</p></div>
      </section>

      <section className="workspace">
        <div className="toolbar">
          <div className="filters">
            {["All", "Open", "Done", "Work", "Planning", "Personal"].map(item => (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
          <label className="search"><Search/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks" /></label>
        </div>

        <div className="list-head"><span>TO DO</span><span>{visible.length} {visible.length === 1 ? "ITEM" : "ITEMS"}</span></div>
        <div className="task-list">
          {visible.map(task => (
            <article className={`task ${task.done ? "completed" : ""}`} key={task.id}>
              <button className="check" aria-label={task.done ? "Mark incomplete" : "Mark complete"} onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t))}>{task.done && <Check />}</button>
              <div className="task-body">
                <h3>{task.title}</h3>
                <div className="meta">
                  <span className={`tag ${task.category.toLowerCase()}`}>{task.category}</span>
                  <span className={`priority ${task.priority.toLowerCase()}`}><i />{task.priority}</span>
                  <span className="date"><Calendar/>{formatDate(task.due)}</span>
                </div>
              </div>
              <button className="delete" aria-label={`Delete ${task.title}`} onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}><Trash/></button>
            </article>
          ))}
          {!visible.length && <div className="empty"><Leaf/><h3>Nothing here yet</h3><p>Enjoy the breathing room, or add a new task.</p></div>}
        </div>
      </section>

      <footer><span>FALL FOCUS</span><p>Small progress is still progress.</p><span>EST. 2026</span></footer>

      {showForm && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowForm(false)}>
        <form className="modal" onSubmit={addTask}>
          <button type="button" className="close" aria-label="Close" onClick={() => setShowForm(false)}><X/></button>
          <p className="eyebrow">A FRESH START</p>
          <h2>Add something<br/><em>worth finishing.</em></h2>
          <label>Task name<input autoFocus required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="What needs to get done?" /></label>
          <div className="form-row">
            <label>Category<select value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option>Work</option><option>Planning</option><option>Personal</option></select></label>
            <label>Priority<select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select></label>
          </div>
          <label>Due date<input type="date" required value={form.due} onChange={e => setForm({...form, due: e.target.value})} /></label>
          <button className="primary submit" type="submit"><Plus/> Add task</button>
        </form>
      </div>}
    </main>
  );
}
