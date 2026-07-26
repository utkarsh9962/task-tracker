/* ========================================================================
   TaskPulse — Project Management Task Tracker
   Light theme · Claude Orange · Full status workflow · Notes/Comments
   ======================================================================== */

// ─── Constants ──────────────────────────────────────────────────────────────
const STATUSES = [
  { key: 'selected',   label: 'Selected for Development', badge: 'badge-selected',   color: '#3b82f6' },
  { key: 'inprogress', label: 'In Progress',              badge: 'badge-inprogress', color: '#f59e0b' },
  { key: 'testing',    label: 'Ready for Testing',        badge: 'badge-testing',     color: '#8b5cf6' },
  { key: 'done',       label: 'Done',                     badge: 'badge-done',        color: '#10b981' },
  { key: 'closed',     label: 'Closed',                   badge: 'badge-closed',      color: '#64748b' },
];

const STATUS_MAP = {};
STATUSES.forEach(s => STATUS_MAP[s.key] = s);

const TICKET_TYPE_COLORS = {
  'ZST': { color: '#e8754a', bg: 'rgba(232, 117, 74, 0.1)' },
  'WP':  { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  'NET': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  'MOB': { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  'CMS': { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
};

const AVATAR_COLORS = [
  '#e8754a', '#d97706', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#ef4444', '#14b8a6', '#f43f5e'
];


// ─── Utility Functions ──────────────────────────────────────────────────────
const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getTimeRemaining = (targetDate) => {
  const total = Date.parse(targetDate) - Date.now();
  const absDays = Math.floor(Math.abs(total) / (1000 * 60 * 60 * 24));
  const absHours = Math.floor((Math.abs(total) / (1000 * 60 * 60)) % 24);
  const absMinutes = Math.floor((Math.abs(total) / 1000 / 60) % 60);
  return { total, days: absDays, hours: absHours, minutes: absMinutes, isOverdue: total < 0 };
};

const isTerminalStatus = (status) => status === 'done' || status === 'closed';

const formatCountdown = (targetDate, status) => {
  if (isTerminalStatus(status)) return `<span style="color:var(--status-${status === 'done' ? 'done' : 'closed'});">${STATUS_MAP[status].label}</span>`;
  const { days, hours, minutes, isOverdue } = getTimeRemaining(targetDate);
  if (isOverdue) return `<span style="color:var(--status-overdue);">${days}d overdue</span>`;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
};

const getCountdownClass = (targetDate, status) => {
  if (isTerminalStatus(status)) return '';
  const { days, isOverdue } = getTimeRemaining(targetDate);
  if (isOverdue) return 'danger';
  if (days <= 3) return 'warning';
  return '';
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
};

const getRandomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

const getTicketColor = (type) => {
  if (TICKET_TYPE_COLORS[type]) return TICKET_TYPE_COLORS[type];
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = type.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return { color: `hsl(${h}, 60%, 50%)`, bg: `hsla(${h}, 60%, 50%, 0.1)` };
};

const escapeHtml = (str) => {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};


// ─── State Management ───────────────────────────────────────────────────────
class AppState {
  constructor() {
    this.storageKey = 'taskPulseData_v2';
    this.loadState();
  }

  loadState() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      try {
        const p = JSON.parse(data);
        this.tasks = p.tasks || [];
        this.developers = p.developers || [];
        this.ticketTypes = p.ticketTypes || ['ZST', 'WP', 'NET', 'MOB', 'CMS'];
      } catch (e) {
        console.error('Failed to parse state', e);
        this.seedData();
      }
    } else {
      this.seedData();
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify({
      tasks: this.tasks, developers: this.developers, ticketTypes: this.ticketTypes
    }));
  }

  seedData() {
    const d1 = generateId(), d2 = generateId(), d3 = generateId();
    this.developers = [
      { id: d1, name: 'Anant',  color: '#e8754a' },
      { id: d2, name: 'Priya',  color: '#8b5cf6' },
      { id: d3, name: 'Rohan',  color: '#10b981' },
    ];

    const today = new Date();
    const ago = (d) => { const t = new Date(today); t.setDate(t.getDate() - d); return t.toISOString(); };
    const future = (d) => { const t = new Date(today); t.setDate(t.getDate() + d); return t.toISOString(); };

    this.tasks = [
      { id: generateId(), developerId: d1, ticketType: 'ZST', ticketNumber: '1024', fullTicket: 'ZST-1024',
        description: 'Fix authentication flow on mobile', notes: 'Discussed with backend team — need to update token refresh logic. Check Slack thread from Jul 20.',
        assignedDate: ago(7), targetDate: future(7), status: 'inprogress' },
      { id: generateId(), developerId: d2, ticketType: 'WP', ticketNumber: '2048', fullTicket: 'WP-2048',
        description: 'Redesign landing page hero section', notes: 'New Figma mockups approved. Use the v3 design.',
        assignedDate: ago(14), targetDate: ago(1), status: 'testing' },
      { id: generateId(), developerId: d3, ticketType: 'NET', ticketNumber: '3072', fullTicket: 'NET-3072',
        description: 'REST API v2 integration', notes: '',
        assignedDate: ago(14), targetDate: ago(2), status: 'done' },
      { id: generateId(), developerId: d1, ticketType: 'MOB', ticketNumber: '4096', fullTicket: 'MOB-4096',
        description: 'Push notification service setup', notes: 'Use Firebase Cloud Messaging. Anant to share APNs certificate.',
        assignedDate: ago(2), targetDate: future(2), status: 'selected' },
      { id: generateId(), developerId: d2, ticketType: 'CMS', ticketNumber: '5120', fullTicket: 'CMS-5120',
        description: 'Content migration pipeline', notes: '',
        assignedDate: ago(0), targetDate: future(5), status: 'selected' },
    ];

    this.ticketTypes = ['ZST', 'WP', 'NET', 'MOB', 'CMS'];
    this.save();
  }

  // — Getters —
  getTasks()        { return this.tasks; }
  getDevelopers()   { return this.developers; }
  getTicketTypes()  { return this.ticketTypes; }
  getDeveloper(id)  { return this.developers.find(d => d.id === id); }

  // — Task CRUD —
  addTask(t)           { this.tasks.push(t); this.save(); }
  updateTask(id, u)    { const i = this.tasks.findIndex(t => t.id === id); if (i >= 0) { this.tasks[i] = { ...this.tasks[i], ...u }; this.save(); } }
  deleteTask(id)       { this.tasks = this.tasks.filter(t => t.id !== id); this.save(); }
  changeStatus(id, s)  { this.updateTask(id, { status: s }); }
  updateNotes(id, n)   { this.updateTask(id, { notes: n }); }

  // — Developer CRUD —
  addDeveloper(d)      { this.developers.push(d); this.save(); }
  updateDeveloper(id, u) { const i = this.developers.findIndex(d => d.id === id); if (i >= 0) { this.developers[i] = { ...this.developers[i], ...u }; this.save(); } }
  deleteDeveloper(id)  { this.developers = this.developers.filter(d => d.id !== id); this.tasks = this.tasks.filter(t => t.developerId !== id); this.save(); }

  // — Ticket Types —
  addTicketType(t) {
    const u = t.toUpperCase();
    if (!this.ticketTypes.includes(u)) { this.ticketTypes.push(u); this.save(); }
  }
}


// ─── App Controller ─────────────────────────────────────────────────────────
class App {
  constructor() {
    this.state = new AppState();
    this.currentView = 'dashboard';
    this.searchQuery = '';
    this.filters = { developer: 'all', type: 'all', status: 'all' };
    this.sortBy = 'targetDate';
    this.expandedNotes = new Set(); // track which task notes are expanded

    this.viewContainer = document.getElementById('view-container');
    this.modalContainer = document.getElementById('modal-container');
    this.toastContainer = document.getElementById('toast-container');
    this.devProfile = document.getElementById('dev-profile');

    this.bindEvents();
    this.render();
    this.startCountdown();
  }

  // ─── Event Binding ───────────────────────────────────────────────────
  bindEvents() {
    document.addEventListener('click', (e) => {
      // Navigation
      const navItem = e.target.closest('.nav-item');
      if (navItem) {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        navItem.classList.add('active');
        this.currentView = navItem.dataset.view;
        this.closeDevProfile();
        this.render();
        return;
      }

      // Add task modal (global + view button)
      if (e.target.closest('#btn-add-task-global') || e.target.closest('#btn-add-task-modal')) {
        this.showAddTaskModal();
        return;
      }

      // Add developer
      if (e.target.closest('#btn-add-dev-modal')) {
        this.showAddDevModal();
        return;
      }

      // Edit developer
      if (e.target.closest('.btn-edit-dev')) {
        e.stopPropagation();
        const id = e.target.closest('.btn-edit-dev').dataset.id;
        this.showEditDevModal(id);
        return;
      }

      // Delete developer
      if (e.target.closest('.btn-delete-dev')) {
        e.stopPropagation();
        const id = e.target.closest('.btn-delete-dev').dataset.id;
        const dev = this.state.getDeveloper(id);
        const taskCount = this.state.getTasks().filter(t => t.developerId === id).length;
        this.showConfirmModal(
          `Delete ${dev?.name || 'developer'}?`,
          taskCount > 0
            ? `This will also delete <strong>${taskCount} task(s)</strong> assigned to ${dev?.name}. This action cannot be undone.`
            : `Are you sure you want to remove ${dev?.name} from the team?`,
          () => {
            this.state.deleteDeveloper(id);
            this.closeDevProfile();
            this.showToast(`${dev?.name} removed`, 'success');
            this.render();
          }
        );
        return;
      }

      // Delete task
      if (e.target.closest('.btn-delete-task')) {
        const id = e.target.closest('.btn-delete-task').dataset.id;
        this.showConfirmModal('Delete task?', 'This action cannot be undone.', () => {
          this.state.deleteTask(id);
          this.showToast('Task deleted', 'success');
          this.render();
        });
        return;
      }

      // Edit notes
      if (e.target.closest('.btn-edit-notes')) {
        const id = e.target.closest('.btn-edit-notes').dataset.id;
        this.showEditNotesModal(id);
        return;
      }

      // Toggle notes visibility
      if (e.target.closest('.notes-toggle')) {
        const id = e.target.closest('.notes-toggle').dataset.id;
        if (this.expandedNotes.has(id)) this.expandedNotes.delete(id);
        else this.expandedNotes.add(id);
        this.render();
        return;
      }

      // Developer card click (open profile)
      if (e.target.closest('.dev-card') && !e.target.closest('.dev-card-actions')) {
        const id = e.target.closest('.dev-card').dataset.id;
        this.openDevProfile(id);
        return;
      }

      // Close dev profile
      if (e.target.closest('.close-profile')) {
        this.closeDevProfile();
        return;
      }

      // Modal close
      if (e.target.closest('.modal-close') || e.target.classList.contains('modal-overlay')) {
        this.closeModal();
        return;
      }

      // Confirm action button
      if (e.target.closest('#confirm-action-btn')) {
        if (this._pendingConfirm) {
          this._pendingConfirm();
          this._pendingConfirm = null;
        }
        this.closeModal();
        return;
      }

      // Mobile menu
      if (e.target.closest('#mobile-menu-btn')) {
        document.getElementById('sidebar').classList.toggle('mobile-open');
        return;
      }
    });

    // Status change
    document.addEventListener('change', (e) => {
      if (e.target.closest('.task-status-select')) {
        const id = e.target.closest('.task-status-select').dataset.id;
        this.state.changeStatus(id, e.target.value);
        this.showToast('Status updated', 'success');
        this.render();
        return;
      }

      // Filters
      if (e.target.id === 'filter-dev') { this.filters.developer = e.target.value; this.render(); }
      if (e.target.id === 'filter-type') { this.filters.type = e.target.value; this.render(); }
      if (e.target.id === 'filter-status') { this.filters.status = e.target.value; this.render(); }
      if (e.target.id === 'sort-tasks') { this.sortBy = e.target.value; this.render(); }

      // Dynamic "Add New" in modal
      if (e.target.id === 'task-dev-select') {
        const g = document.getElementById('new-dev-input-group');
        if (g) g.style.display = e.target.value === 'add-new' ? 'block' : 'none';
      }
      if (e.target.id === 'task-type-select') {
        const g = document.getElementById('new-type-input-group');
        if (g) g.style.display = e.target.value === 'add-more' ? 'block' : 'none';
      }
    });

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Form submits
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'add-task-form')   { e.preventDefault(); this.handleAddTask(e.target); }
      if (e.target.id === 'add-dev-form')    { e.preventDefault(); this.handleAddDev(e.target); }
      if (e.target.id === 'edit-dev-form')   { e.preventDefault(); this.handleEditDev(e.target); }
      if (e.target.id === 'edit-notes-form') { e.preventDefault(); this.handleEditNotes(e.target); }
    });
  }

  // ─── Countdown Timer ─────────────────────────────────────────────────
  startCountdown() {
    setInterval(() => {
      document.querySelectorAll('[data-target-date]').forEach(el => {
        const td = el.dataset.targetDate;
        const st = el.dataset.status;
        el.innerHTML = formatCountdown(td, st);
      });
    }, 60000);
  }

  // ─── Filtering ───────────────────────────────────────────────────────
  getFilteredTasks() {
    let tasks = [...this.state.getTasks()];

    if (this.searchQuery) {
      tasks = tasks.filter(t =>
        t.fullTicket.toLowerCase().includes(this.searchQuery) ||
        (t.description || '').toLowerCase().includes(this.searchQuery) ||
        (this.state.getDeveloper(t.developerId)?.name || '').toLowerCase().includes(this.searchQuery)
      );
    }

    if (this.currentView === 'tasks') {
      if (this.filters.developer !== 'all') tasks = tasks.filter(t => t.developerId === this.filters.developer);
      if (this.filters.type !== 'all') tasks = tasks.filter(t => t.ticketType === this.filters.type);
      if (this.filters.status !== 'all') {
        if (this.filters.status === 'overdue') {
          tasks = tasks.filter(t => !isTerminalStatus(t.status) && getTimeRemaining(t.targetDate).isOverdue);
        } else {
          tasks = tasks.filter(t => t.status === this.filters.status);
        }
      }
    }

    tasks.sort((a, b) => {
      if (this.sortBy === 'targetDate') return new Date(a.targetDate) - new Date(b.targetDate);
      if (this.sortBy === 'assignedDate') return new Date(b.assignedDate) - new Date(a.assignedDate);
      if (this.sortBy === 'status') {
        const order = { selected: 0, inprogress: 1, testing: 2, done: 3, closed: 4 };
        return (order[a.status] ?? 5) - (order[b.status] ?? 5);
      }
      return 0;
    });
    return tasks;
  }

  // ─── Main Render ─────────────────────────────────────────────────────
  render() {
    switch (this.currentView) {
      case 'dashboard':   this.viewContainer.innerHTML = this.renderDashboard(); break;
      case 'tasks':       this.viewContainer.innerHTML = this.renderTasksView(); break;
      case 'developers':  this.viewContainer.innerHTML = this.renderDevsView(); break;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── Dashboard ───────────────────────────────────────────────────────
  renderDashboard() {
    const all = this.state.getTasks();
    const active = all.filter(t => !isTerminalStatus(t.status));
    const devCount = this.state.getDevelopers().length;
    const overdue = active.filter(t => getTimeRemaining(t.targetDate).isOverdue).length;
    const now = new Date();
    const closedThisMonth = all.filter(t => {
      if (t.status !== 'done' && t.status !== 'closed') return false;
      const d = new Date(t.assignedDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const recent = [...all].sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate)).slice(0, 5);

    return `
      <div class="view-header">
        <div><h1>Dashboard</h1><p class="view-subtitle">Project overview and recent activity</p></div>
      </div>

      <div class="dashboard-grid">
        <div class="stat-card stagger-1">
          <div class="stat-icon orange"><i data-lucide="clipboard-list"></i></div>
          <div class="stat-info"><h3>Active Tasks</h3><div class="stat-value">${active.length}</div></div>
        </div>
        <div class="stat-card stagger-2">
          <div class="stat-icon blue"><i data-lucide="users"></i></div>
          <div class="stat-info"><h3>Developers</h3><div class="stat-value">${devCount}</div></div>
        </div>
        <div class="stat-card stagger-3" ${overdue > 0 ? 'style="border-color:rgba(239,68,68,0.35);"' : ''}>
          <div class="stat-icon red"><i data-lucide="alert-triangle"></i></div>
          <div class="stat-info"><h3>Overdue</h3><div class="stat-value" ${overdue > 0 ? 'style="color:var(--status-overdue);"' : ''}>${overdue}</div></div>
        </div>
        <div class="stat-card stagger-4">
          <div class="stat-icon green"><i data-lucide="check-circle-2"></i></div>
          <div class="stat-info"><h3>Done This Month</h3><div class="stat-value">${closedThisMonth}</div></div>
        </div>
      </div>

      <div class="section-header">
        <h2>Recent Tasks</h2>
        <a href="#" class="nav-link" onclick="document.querySelector('[data-view=tasks]').click();return false;">View All →</a>
      </div>
      <div class="table-container">${this.renderTaskTable(recent, false)}</div>
    `;
  }

  // ─── Tasks View ──────────────────────────────────────────────────────
  renderTasksView() {
    const tasks = this.getFilteredTasks();
    const devs = this.state.getDevelopers();
    const types = this.state.getTicketTypes();

    return `
      <div class="view-header">
        <div><h1>Tasks</h1><p class="view-subtitle">Manage tickets, deadlines, and status</p></div>
        <button class="btn btn-primary" id="btn-add-task-modal"><i data-lucide="plus" style="width:15px;height:15px;"></i> Add Task</button>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <label class="form-label">Developer</label>
          <select class="form-control custom-dropdown" id="filter-dev">
            <option value="all">All</option>
            ${devs.map(d => `<option value="${d.id}" ${this.filters.developer === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">Type</label>
          <select class="form-control custom-dropdown" id="filter-type">
            <option value="all">All</option>
            ${types.map(t => `<option value="${t}" ${this.filters.type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">Status</label>
          <select class="form-control custom-dropdown" id="filter-status">
            <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All</option>
            ${STATUSES.map(s => `<option value="${s.key}" ${this.filters.status === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
            <option value="overdue" ${this.filters.status === 'overdue' ? 'selected' : ''}>⚠ Overdue</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="form-label">Sort</label>
          <select class="form-control custom-dropdown" id="sort-tasks">
            <option value="targetDate" ${this.sortBy === 'targetDate' ? 'selected' : ''}>Deadline</option>
            <option value="assignedDate" ${this.sortBy === 'assignedDate' ? 'selected' : ''}>Assigned</option>
            <option value="status" ${this.sortBy === 'status' ? 'selected' : ''}>Status</option>
          </select>
        </div>
      </div>

      <div class="table-container">${this.renderTaskTable(tasks, true)}</div>
    `;
  }

  // ─── Task Table ──────────────────────────────────────────────────────
  renderTaskTable(tasks, showActions = false) {
    if (!tasks.length) {
      return `<div class="empty-state"><i data-lucide="inbox"></i><h3>No tasks found</h3><p>Create a new task or adjust your filters.</p></div>`;
    }

    return `
      <table class="task-table">
        <thead><tr>
          <th>Ticket</th><th>Developer</th><th>Description</th><th>Deadline</th><th>Time Left</th><th>Status</th>${showActions ? '<th class="text-right">Actions</th>' : ''}
        </tr></thead>
        <tbody>
          ${tasks.map(t => {
            const dev = this.state.getDeveloper(t.developerId);
            const tc = getTicketColor(t.ticketType);
            const sInfo = STATUS_MAP[t.status] || STATUS_MAP['selected'];
            const hasNotes = t.notes && t.notes.trim().length > 0;
            const notesExpanded = this.expandedNotes.has(t.id);

            return `
              <tr>
                <td>
                  <div class="task-title-cell">
                    <span class="tag" style="color:${tc.color};background:${tc.bg};border-color:${tc.color}30;">${t.ticketType}</span>
                    <span class="task-id">${t.ticketNumber}</span>
                  </div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:0.4rem;">
                    <div class="avatar" style="width:26px;height:26px;font-size:0.6rem;background:${dev?.color || '#999'};">${getInitials(dev?.name)}</div>
                    <span style="font-size:0.82rem;">${dev?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td>
                  <div>
                    <span style="color:var(--text-secondary);font-size:0.82rem;">${escapeHtml(t.description) || '—'}</span>
                    ${hasNotes || showActions ? `
                      <div class="notes-section">
                        <button class="notes-toggle" data-id="${t.id}">
                          <i data-lucide="${notesExpanded ? 'chevron-down' : 'chevron-right'}" style="width:12px;height:12px;"></i>
                          ${hasNotes ? 'Notes' : 'Add notes'}
                        </button>
                        ${notesExpanded ? `
                          <div class="notes-content">
                            ${hasNotes ? escapeHtml(t.notes) : '<span class="notes-empty">No notes yet</span>'}
                          </div>
                          <button class="btn btn-ghost btn-sm btn-edit-notes" data-id="${t.id}" style="margin-top:0.3rem;font-size:0.7rem;">
                            <i data-lucide="pencil" style="width:10px;height:10px;"></i> Edit notes
                          </button>
                        ` : ''}
                      </div>
                    ` : ''}
                  </div>
                </td>
                <td style="white-space:nowrap;">${formatDate(t.targetDate)}</td>
                <td>
                  <div class="countdown ${getCountdownClass(t.targetDate, t.status)}" data-target-date="${t.targetDate}" data-status="${t.status}">
                    ${formatCountdown(t.targetDate, t.status)}
                  </div>
                </td>
                <td>
                  ${showActions ? `
                    <select class="form-control custom-dropdown task-status-select" data-id="${t.id}" style="font-size:0.75rem;padding:0.3rem 1.8rem 0.3rem 0.5rem;border-radius:9999px;font-weight:600;color:${sInfo.color};border-color:${sInfo.color}30;background-color:transparent;min-width:auto;">
                      ${STATUSES.map(s => `<option value="${s.key}" ${t.status === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
                    </select>
                  ` : `<span class="badge ${sInfo.badge}">${sInfo.label}</span>`}
                </td>
                ${showActions ? `
                  <td class="text-right">
                    <div style="display:flex;gap:0.25rem;justify-content:flex-end;">
                      <button class="btn btn-icon btn-delete-task" data-id="${t.id}" title="Delete task">
                        <i data-lucide="trash-2" style="width:14px;height:14px;color:var(--status-overdue);"></i>
                      </button>
                    </div>
                  </td>
                ` : ''}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // ─── Developers View ─────────────────────────────────────────────────
  renderDevsView() {
    let devs = this.state.getDevelopers();
    if (this.searchQuery) devs = devs.filter(d => d.name.toLowerCase().includes(this.searchQuery));

    return `
      <div class="view-header">
        <div><h1>Developers</h1><p class="view-subtitle">Team members and assignments</p></div>
        <button class="btn btn-primary" id="btn-add-dev-modal"><i data-lucide="user-plus" style="width:15px;height:15px;"></i> Add Developer</button>
      </div>
      <div class="dev-grid">
        ${devs.map((d, i) => {
          const dt = this.state.getTasks().filter(t => t.developerId === d.id);
          const active = dt.filter(t => !isTerminalStatus(t.status)).length;
          const done = dt.filter(t => isTerminalStatus(t.status)).length;
          const overdue = dt.filter(t => !isTerminalStatus(t.status) && getTimeRemaining(t.targetDate).isOverdue).length;
          const progress = dt.length ? Math.round((done / dt.length) * 100) : 0;
          return `
            <div class="dev-card stagger-${Math.min(i + 1, 4)}" data-id="${d.id}">
              <div class="dev-card-actions">
                <button class="btn btn-icon btn-edit-dev" data-id="${d.id}" title="Edit"><i data-lucide="pencil" style="width:13px;height:13px;"></i></button>
                <button class="btn btn-icon btn-delete-dev" data-id="${d.id}" title="Delete"><i data-lucide="trash-2" style="width:13px;height:13px;color:var(--status-overdue);"></i></button>
              </div>
              <div class="dev-header">
                <div class="avatar" style="background:${d.color};">${getInitials(d.name)}</div>
                <div class="dev-info"><h4>${escapeHtml(d.name)}</h4><p>${dt.length} task${dt.length !== 1 ? 's' : ''}</p></div>
              </div>
              <div class="dev-stats">
                <div><span style="color:var(--accent-primary);">${active}</span><span>Active</span></div>
                <div><span style="color:${overdue > 0 ? 'var(--status-overdue)' : 'var(--text-muted)'};">${overdue}</span><span>Overdue</span></div>
                <div><span style="color:var(--status-done);">${done}</span><span>Done</span></div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
                  <span style="font-size:0.7rem;color:var(--text-muted);">Progress</span>
                  <span style="font-size:0.7rem;color:var(--text-secondary);">${progress}%</span>
                </div>
                <div class="progress-container"><div class="progress-bar" style="width:${progress}%;"></div></div>
              </div>
            </div>
          `;
        }).join('')}
        ${!devs.length ? '<div class="empty-state" style="grid-column:1/-1;"><i data-lucide="users"></i><h3>No developers</h3><p>Add a developer to get started.</p></div>' : ''}
      </div>
    `;
  }

  // ─── Developer Profile Panel ─────────────────────────────────────────
  openDevProfile(devId) {
    const dev = this.state.getDeveloper(devId);
    if (!dev) return;
    const devTasks = this.state.getTasks().filter(t => t.developerId === devId);
    const active = devTasks.filter(t => !isTerminalStatus(t.status)).length;
    const done = devTasks.filter(t => isTerminalStatus(t.status)).length;

    this.devProfile.innerHTML = `
      <div class="dev-profile-header">
        <button class="close-profile"><i data-lucide="x"></i></button>
        <div class="avatar" style="background:${dev.color};width:68px;height:68px;font-size:1.6rem;margin:0 auto 0.75rem;">${getInitials(dev.name)}</div>
        <h3>${escapeHtml(dev.name)}</h3>
        <p style="color:var(--text-muted);font-size:0.82rem;margin-top:0.2rem;">${active} active · ${done} completed</p>
        <div style="display:flex;gap:0.5rem;justify-content:center;margin-top:0.75rem;">
          <button class="btn btn-secondary btn-sm btn-edit-dev" data-id="${dev.id}"><i data-lucide="pencil" style="width:12px;height:12px;"></i> Edit</button>
          <button class="btn btn-danger btn-sm btn-delete-dev" data-id="${dev.id}"><i data-lucide="trash-2" style="width:12px;height:12px;"></i> Delete</button>
        </div>
      </div>
      <div class="dev-profile-content">
        <h4 style="margin-bottom:0.75rem;font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Assigned Tasks</h4>
        <div class="dev-task-list">
          ${!devTasks.length ? '<p style="color:var(--text-muted);font-size:0.82rem;">No tasks assigned</p>' : ''}
          ${devTasks.map(t => {
            const tc = getTicketColor(t.ticketType);
            const sInfo = STATUS_MAP[t.status] || STATUS_MAP['selected'];
            return `
              <div class="dev-task-item">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                  <span class="tag" style="color:${tc.color};background:${tc.bg};border-color:${tc.color}30;">${t.fullTicket}</span>
                  <span class="badge ${sInfo.badge}" style="font-size:0.65rem;">${sInfo.label}</span>
                </div>
                <p style="font-size:0.82rem;margin-bottom:0.3rem;">${escapeHtml(t.description) || 'No description'}</p>
                ${t.notes ? `<div class="notes-content" style="margin-top:0.4rem;font-size:0.75rem;">${escapeHtml(t.notes)}</div>` : ''}
                <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-muted);margin-top:0.4rem;">
                  <span>Due: ${formatDate(t.targetDate)}</span>
                  <span class="countdown ${getCountdownClass(t.targetDate, t.status)}" style="padding:0.1rem 0.35rem;font-size:0.68rem;">${formatCountdown(t.targetDate, t.status)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    this.devProfile.classList.add('open');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  closeDevProfile() { this.devProfile.classList.remove('open'); }

  // ─── Add Task Modal ──────────────────────────────────────────────────
  showAddTaskModal() {
    const todayStr = new Date().toISOString().split('T')[0];
    const devs = this.state.getDevelopers();
    const types = this.state.getTicketTypes();

    this.modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal">
          <div class="modal-header">
            <h2>Add New Task</h2>
            <button class="modal-close"><i data-lucide="x"></i></button>
          </div>
          <form id="add-task-form">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Developer *</label>
                <select class="form-control custom-dropdown" name="developerId" id="task-dev-select" required>
                  <option value="" disabled selected>Select developer</option>
                  ${devs.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
                  <option value="add-new">＋ Add New Developer</option>
                </select>
              </div>
              <div class="form-group" id="new-dev-input-group" style="display:none;">
                <label class="form-label">New Developer Name *</label>
                <input type="text" class="form-control" name="newDeveloperName" placeholder="Full name">
              </div>
              <div style="display:flex;gap:0.75rem;">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Ticket Type *</label>
                  <select class="form-control custom-dropdown" name="ticketType" id="task-type-select" required>
                    ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
                    <option value="add-more">＋ Add More</option>
                  </select>
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Ticket Number *</label>
                  <input type="text" class="form-control" name="ticketNumber" placeholder="e.g. 1234" required>
                </div>
              </div>
              <div class="form-group" id="new-type-input-group" style="display:none;">
                <label class="form-label">New Ticket Prefix *</label>
                <input type="text" class="form-control" name="newTicketType" placeholder="e.g. TST" style="text-transform:uppercase;" maxlength="5">
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="description" rows="2" placeholder="Brief task description"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Notes / Meeting Comments</label>
                <textarea class="form-control" name="notes" rows="2" placeholder="Notes from standup, meeting decisions, etc."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Initial Status</label>
                <select class="form-control custom-dropdown" name="status">
                  ${STATUSES.map(s => `<option value="${s.key}">${s.label}</option>`).join('')}
                </select>
              </div>
              <div style="display:flex;gap:0.75rem;">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Assigned Date</label>
                  <input type="date" class="form-control" name="assignedDate" value="${todayStr}">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Target Date *</label>
                  <input type="date" class="form-control" name="targetDate" min="${todayStr}" required>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close">Cancel</button>
              <button type="submit" class="btn btn-primary"><i data-lucide="plus" style="width:14px;height:14px;"></i> Add Task</button>
            </div>
          </form>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── Add Developer Modal ─────────────────────────────────────────────
  showAddDevModal() {
    this.modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal">
          <div class="modal-header"><h2>Add Developer</h2><button class="modal-close"><i data-lucide="x"></i></button></div>
          <form id="add-dev-form">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Developer Name *</label>
                <input type="text" class="form-control" name="name" placeholder="Full name" required autofocus>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close">Cancel</button>
              <button type="submit" class="btn btn-primary"><i data-lucide="user-plus" style="width:14px;height:14px;"></i> Add</button>
            </div>
          </form>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── Edit Developer Modal ────────────────────────────────────────────
  showEditDevModal(devId) {
    const dev = this.state.getDeveloper(devId);
    if (!dev) return;

    this.modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal">
          <div class="modal-header"><h2>Edit Developer</h2><button class="modal-close"><i data-lucide="x"></i></button></div>
          <form id="edit-dev-form">
            <input type="hidden" name="devId" value="${dev.id}">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Name *</label>
                <input type="text" class="form-control" name="name" value="${escapeHtml(dev.name)}" required autofocus>
              </div>
              <div class="form-group">
                <label class="form-label">Accent Color</label>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.25rem;">
                  ${AVATAR_COLORS.map(c => `
                    <label style="cursor:pointer;">
                      <input type="radio" name="color" value="${c}" ${dev.color === c ? 'checked' : ''} style="display:none;">
                      <div style="width:32px;height:32px;border-radius:50%;background:${c};border:3px solid ${dev.color === c ? 'var(--text-primary)' : 'transparent'};transition:border 0.15s;cursor:pointer;" onmouseover="this.style.borderColor='var(--border-medium)'" onmouseout="this.style.borderColor='${dev.color === c ? 'var(--text-primary)' : 'transparent'}'"></div>
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close">Cancel</button>
              <button type="submit" class="btn btn-primary"><i data-lucide="save" style="width:14px;height:14px;"></i> Save</button>
            </div>
          </form>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── Edit Notes Modal ────────────────────────────────────────────────
  showEditNotesModal(taskId) {
    const task = this.state.getTasks().find(t => t.id === taskId);
    if (!task) return;

    this.modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal">
          <div class="modal-header"><h2>Edit Notes — ${escapeHtml(task.fullTicket)}</h2><button class="modal-close"><i data-lucide="x"></i></button></div>
          <form id="edit-notes-form">
            <input type="hidden" name="taskId" value="${task.id}">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Meeting Notes / Comments</label>
                <textarea class="form-control" name="notes" rows="5" placeholder="Decisions from standup, blockers, action items…" autofocus>${escapeHtml(task.notes || '')}</textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary modal-close">Cancel</button>
              <button type="submit" class="btn btn-primary"><i data-lucide="save" style="width:14px;height:14px;"></i> Save Notes</button>
            </div>
          </form>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── Confirm Modal ───────────────────────────────────────────────────
  showConfirmModal(title, message, onConfirm) {
    this._pendingConfirm = onConfirm;
    this.modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal" style="max-width:400px;">
          <div class="modal-header"><h2>${title}</h2><button class="modal-close"><i data-lucide="x"></i></button></div>
          <div class="modal-body"><p style="font-size:0.9rem;color:var(--text-secondary);">${message}</p></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirm-action-btn"><i data-lucide="trash-2" style="width:14px;height:14px;"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── Form Handlers ───────────────────────────────────────────────────
  handleAddTask(form) {
    const fd = new FormData(form);
    let devId = fd.get('developerId');
    if (devId === 'add-new') {
      const n = fd.get('newDeveloperName')?.trim();
      if (!n) return this.showToast('Enter a developer name', 'error');
      devId = generateId();
      this.state.addDeveloper({ id: devId, name: n, color: getRandomColor() });
    }
    if (!devId) return this.showToast('Select a developer', 'error');

    let type = fd.get('ticketType');
    if (type === 'add-more') {
      type = fd.get('newTicketType')?.trim().toUpperCase();
      if (!type) return this.showToast('Enter a ticket prefix', 'error');
      this.state.addTicketType(type);
    }
    const num = fd.get('ticketNumber')?.trim();
    if (!num) return this.showToast('Enter a ticket number', 'error');
    const target = fd.get('targetDate');
    if (!target) return this.showToast('Select a target date', 'error');

    this.state.addTask({
      id: generateId(), developerId: devId, ticketType: type, ticketNumber: num,
      fullTicket: `${type}-${num}`, description: fd.get('description')?.trim() || '',
      notes: fd.get('notes')?.trim() || '',
      assignedDate: new Date(fd.get('assignedDate') || new Date()).toISOString(),
      targetDate: new Date(target).toISOString(),
      status: fd.get('status') || 'selected'
    });
    this.closeModal();
    this.showToast(`Task ${type}-${num} added!`, 'success');
    this.render();
  }

  handleAddDev(form) {
    const name = new FormData(form).get('name')?.trim();
    if (!name) return this.showToast('Enter a name', 'error');
    this.state.addDeveloper({ id: generateId(), name, color: getRandomColor() });
    this.closeModal();
    this.showToast(`${name} added to team!`, 'success');
    this.render();
  }

  handleEditDev(form) {
    const fd = new FormData(form);
    const id = fd.get('devId');
    const name = fd.get('name')?.trim();
    if (!name) return this.showToast('Name is required', 'error');
    const color = fd.get('color') || getRandomColor();
    this.state.updateDeveloper(id, { name, color });
    this.closeModal();
    this.closeDevProfile();
    this.showToast(`${name} updated`, 'success');
    this.render();
  }

  handleEditNotes(form) {
    const fd = new FormData(form);
    const id = fd.get('taskId');
    const notes = fd.get('notes')?.trim() || '';
    this.state.updateNotes(id, notes);
    this.expandedNotes.add(id);
    this.closeModal();
    this.showToast('Notes saved', 'success');
    this.render();
  }

  // ─── Modal Helpers ───────────────────────────────────────────────────
  closeModal() {
    const ov = this.modalContainer.querySelector('.modal-overlay');
    if (ov) {
      ov.classList.remove('active');
      setTimeout(() => { this.modalContainer.innerHTML = ''; }, 300);
    } else {
      this.modalContainer.innerHTML = '';
    }
  }

  // ─── Toast ───────────────────────────────────────────────────────────
  showToast(message, type = 'success') {
    const icons = { success: 'check-circle-2', error: 'alert-circle', warning: 'alert-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon"><i data-lucide="${icons[type] || 'info'}"></i></div>
      <div class="toast-content"><h5>${type.charAt(0).toUpperCase() + type.slice(1)}</h5><p>${message}</p></div>
    `;
    this.toastContainer.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}


// ─── Initialize ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
