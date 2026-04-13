const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');

const ensureDataDir = () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.error('Unable to create data directory:', error);
    process.exit(1);
  }
};

ensureDataDir();

const loadData = (fileName, fallback) => {
  const filePath = path.join(dataDir, fileName);

  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    } catch (error) {
      console.error(`Unable to create ${fileName}:`, error);
    }
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) || fallback;
  } catch (error) {
    console.error(`Invalid JSON in ${fileName}, resetting to fallback:`, error);
    try {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    } catch (writeError) {
      console.error(`Unable to reset ${fileName}:`, writeError);
    }
    return fallback;
  }
};

const saveData = (fileName, data) => {
  try {
    fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to save ${fileName}:`, error);
  }
};

const users = loadData('users.json', [
  {
    id: 1,
    name: 'Muktar Usman',
    email: 'muktarusman329@gmail.com',
    password: 'student123',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
]);
const messages = loadData('messages.json', []);
const chatHistory = loadData('chatHistory.json', []);

app.use(express.json());
app.use(
  session({
    secret: 'student-portfolio-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'card.html'));
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid login credentials.' });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.json({ success: true, user: req.session.user });
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const exists = users.some((item) => item.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'A user with this email already exists.' });
  }

  const nextId = users.length ? Math.max(...users.map((item) => item.id)) + 1 : 1;
  const newUser = {
    id: nextId,
    name,
    email,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveData('users.json', users);

  req.session.user = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };

  res.json({ success: true, user: req.session.user });
});

app.get('/api/user', (req, res) => {
  if (!req.session.user) {
    return res.json({ user: null });
  }
  res.json({ user: req.session.user });
});

app.get('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const newMessage = {
    id: messages.length ? Math.max(...messages.map((item) => item.id)) + 1 : 1,
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  saveData('messages.json', messages);

  res.json({ success: true, message: 'Your message was sent successfully.' });
});

app.post('/api/message', (req, res) => {
  const { userMessage, aiResponse } = req.body;
  if (!userMessage || !aiResponse) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const historyEntry = {
    id: chatHistory.length ? Math.max(...chatHistory.map((item) => item.id)) + 1 : 1,
    userMessage,
    aiResponse,
    createdAt: new Date().toISOString(),
  };
  chatHistory.push(historyEntry);
  saveData('chatHistory.json', chatHistory);

  res.json({ success: true });
});

app.post('/api/ai', (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Please ask a question.' });
  }

  const normalized = question.toLowerCase();
  let answer = 'I can tell you about my studies, skills, projects, and how I work with university teammates.';

  if (normalized.includes('about')) {
    answer = 'I am Muktar Usman, an Information Technology student at Federal University of Technology Minna building modern web apps and student services.';
  } else if (normalized.includes('skill') || normalized.includes('technology')) {
    answer = 'My key skills include HTML, CSS, JavaScript, React, Node.js, responsive design, and accessible UI development.';
  } else if (normalized.includes('project')) {
    answer = 'I build portfolio projects such as a course planner, campus event hub, and interactive student dashboard with charts and login support.';
  } else if (normalized.includes('study') || normalized.includes('university') || normalized.includes('course')) {
    answer = 'I am studying Information Technology and I enjoy creating tools that make campus life easier for students and teams.';
  } else if (normalized.includes('voice') || normalized.includes('speak')) {
    answer = 'This assistant can speak responses using your browser voice engine and support a conversational workflow.';
  }

  res.json({ success: true, answer });
});

app.get('/api/chart-data', (req, res) => {
  const now = new Date();
  const labels = [];
  const messagesByDay = [];
  const usersByDay = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    labels.push(dayLabel);

    const dayString = date.toISOString().slice(0, 10);
    messagesByDay.push(messages.filter((item) => item.createdAt.startsWith(dayString)).length);
    usersByDay.push(users.filter((item) => item.createdAt.startsWith(dayString)).length);
  }

  res.json({
    totalUsers: users.length,
    totalMessages: messages.length,
    labels,
    messagesByDay,
    usersByDay,
  });
});

app.get('/api/messages', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Login required.' });
  }
  res.json({ success: true, messages });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port === 3000) {
      console.warn(`Port ${port} is busy. Trying port 3001 instead...`);
      startServer(3001);
      return;
    }
    console.error('Server error:', err);
    process.exit(1);
  });
};

startServer(PORT);
