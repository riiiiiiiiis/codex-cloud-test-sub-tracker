const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, '..', 'data');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

ensureFile(USERS_FILE, []);
ensureFile(SUBSCRIPTIONS_FILE, []);
ensureFile(SESSIONS_FILE, []);

function ensureFile(filePath, defaultValue) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

function readJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content) return [];
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse JSON for', filePath, err);
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateId(collection) {
  const maxId = collection.reduce((max, item) => Math.max(max, item.id || 0), 0);
  return maxId + 1;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = getContentType(ext);
  try {
    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    stream.pipe(res);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

function getContentType(ext) {
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const { hash: verifyHash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

function createSession(userId) {
  const sessions = readJson(SESSIONS_FILE);
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  sessions.push({ token, userId, expiresAt, createdAt: new Date().toISOString() });
  writeJson(SESSIONS_FILE, sessions);
  return token;
}

function cleanupSessions() {
  const sessions = readJson(SESSIONS_FILE);
  const now = Date.now();
  const filtered = sessions.filter(session => session.expiresAt > now);
  if (filtered.length !== sessions.length) {
    writeJson(SESSIONS_FILE, filtered);
  }
}

function getSession(token) {
  if (!token) return null;
  cleanupSessions();
  const sessions = readJson(SESSIONS_FILE);
  return sessions.find(session => session.token === token) || null;
}

function getTokenFromHeaders(req) {
  const authHeader = req.headers['authorization'] || '';
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}

function authenticate(req, res) {
  const token = getTokenFromHeaders(req);
  const session = getSession(token);
  if (!session) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return null;
  }
  const users = readJson(USERS_FILE);
  const user = users.find(u => u.id === session.userId);
  if (!user) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return null;
  }
  return { user, token };
}

function sanitizeUser(user) {
  const { passwordHash, passwordSalt, ...rest } = user;
  return rest;
}

function handleRegister(req, res) {
  parseBody(req)
    .then(body => {
      const { email, password, language = 'ru' } = body;
      if (!email || !password) {
        sendJson(res, 400, { error: 'Email and password are required' });
        return;
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      const users = readJson(USERS_FILE);
      if (users.some(u => u.email === normalizedEmail)) {
        sendJson(res, 409, { error: 'Email already in use' });
        return;
      }
      const { salt, hash } = hashPassword(password);
      const newUser = {
        id: generateId(users),
        email: normalizedEmail,
        passwordHash: hash,
        passwordSalt: salt,
        language,
        displayCurrency: 'USD',
        emailConfirmed: false,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      writeJson(USERS_FILE, users);
      sendJson(res, 201, { message: 'Registration successful' });
    })
    .catch(() => {
      sendJson(res, 400, { error: 'Invalid request body' });
    });
}

function handleLogin(req, res) {
  parseBody(req)
    .then(body => {
      const { email, password } = body;
      if (!email || !password) {
        sendJson(res, 400, { error: 'Email and password are required' });
        return;
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      const users = readJson(USERS_FILE);
      const user = users.find(u => u.email === normalizedEmail);
      if (!user) {
        sendJson(res, 401, { error: 'Invalid credentials' });
        return;
      }
      const valid = verifyPassword(password, user.passwordSalt, user.passwordHash);
      if (!valid) {
        sendJson(res, 401, { error: 'Invalid credentials' });
        return;
      }
      const token = createSession(user.id);
      sendJson(res, 200, {
        token,
        user: sanitizeUser(user),
        message: user.emailConfirmed
          ? 'Login successful'
          : 'Login successful. Please confirm your email to unlock all features.'
      });
    })
    .catch(() => {
      sendJson(res, 400, { error: 'Invalid request body' });
    });
}

function handleLogout(req, res) {
  const token = getTokenFromHeaders(req);
  if (token) {
    const sessions = readJson(SESSIONS_FILE);
    const filtered = sessions.filter(session => session.token !== token);
    writeJson(SESSIONS_FILE, filtered);
  }
  sendJson(res, 200, { message: 'Logged out' });
}

function handleGetUser(req, res) {
  const auth = authenticate(req, res);
  if (!auth) return;
  sendJson(res, 200, { user: sanitizeUser(auth.user) });
}

function handleUpdateUser(req, res) {
  const auth = authenticate(req, res);
  if (!auth) return;
  parseBody(req)
    .then(body => {
      const { language, displayCurrency, emailConfirmed } = body;
      const users = readJson(USERS_FILE);
      const index = users.findIndex(u => u.id === auth.user.id);
      if (index === -1) {
        sendJson(res, 404, { error: 'User not found' });
        return;
      }
      if (language) {
        users[index].language = language;
      }
      if (displayCurrency) {
        users[index].displayCurrency = displayCurrency;
      }
      if (typeof emailConfirmed === 'boolean') {
        users[index].emailConfirmed = emailConfirmed;
      }
      writeJson(USERS_FILE, users);
      sendJson(res, 200, { user: sanitizeUser(users[index]) });
    })
    .catch(() => {
      sendJson(res, 400, { error: 'Invalid request body' });
    });
}

function validateSubscription(payload) {
  const errors = [];
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const description = typeof payload.description === 'string' ? payload.description.trim() : '';
  const amount = Number(payload.amount);
  const currency = ['USD', 'EUR', 'RUB'].includes(payload.currency) ? payload.currency : null;
  const period = ['week', 'month', 'quarter', 'year'].includes(payload.period) ? payload.period : null;
  const nextPayment = payload.nextPayment ? new Date(payload.nextPayment) : null;
  const category = [
    'entertainment',
    'utilities',
    'software',
    'food',
    'health',
    'education',
    'news',
    'productivity',
    'other'
  ].includes(payload.category)
    ? payload.category
    : null;
  const urlValue = typeof payload.url === 'string' ? payload.url.trim() : '';
  const active = typeof payload.active === 'boolean' ? payload.active : true;

  if (!name) errors.push('Name is required');
  if (!currency) errors.push('Currency is invalid');
  if (!period) errors.push('Period is invalid');
  if (!category) errors.push('Category is invalid');
  if (!nextPayment || Number.isNaN(nextPayment.getTime())) errors.push('Next payment date is invalid');
  if (!Number.isFinite(amount) || amount <= 0) errors.push('Amount must be a positive number');

  return {
    errors,
    data: {
      name,
      description,
      amount,
      currency,
      period,
      nextPayment: nextPayment ? new Date(nextPayment.getTime()).toISOString() : null,
      category,
      url: urlValue,
      active
    }
  };
}

function handleListSubscriptions(req, res) {
  const auth = authenticate(req, res);
  if (!auth) return;
  const subscriptions = readJson(SUBSCRIPTIONS_FILE).filter(sub => sub.userId === auth.user.id);
  subscriptions.sort((a, b) => new Date(a.nextPayment) - new Date(b.nextPayment));
  sendJson(res, 200, { subscriptions });
}

function handleCreateSubscription(req, res) {
  const auth = authenticate(req, res);
  if (!auth) return;
  parseBody(req)
    .then(body => {
      const { errors, data } = validateSubscription(body);
      if (errors.length) {
        sendJson(res, 400, { error: errors.join(', ') });
        return;
      }
      const subscriptions = readJson(SUBSCRIPTIONS_FILE);
      const newSubscription = {
        id: generateId(subscriptions),
        userId: auth.user.id,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      subscriptions.push(newSubscription);
      writeJson(SUBSCRIPTIONS_FILE, subscriptions);
      sendJson(res, 201, { subscription: newSubscription });
    })
    .catch(() => sendJson(res, 400, { error: 'Invalid request body' }));
}

function handleUpdateSubscription(req, res, subscriptionId) {
  const auth = authenticate(req, res);
  if (!auth) return;
  parseBody(req)
    .then(body => {
      const { errors, data } = validateSubscription(body);
      if (errors.length) {
        sendJson(res, 400, { error: errors.join(', ') });
        return;
      }
      const subscriptions = readJson(SUBSCRIPTIONS_FILE);
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId && sub.userId === auth.user.id);
      if (index === -1) {
        sendJson(res, 404, { error: 'Subscription not found' });
        return;
      }
      subscriptions[index] = {
        ...subscriptions[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      writeJson(SUBSCRIPTIONS_FILE, subscriptions);
      sendJson(res, 200, { subscription: subscriptions[index] });
    })
    .catch(() => sendJson(res, 400, { error: 'Invalid request body' }));
}

function handleToggleSubscription(req, res, subscriptionId) {
  const auth = authenticate(req, res);
  if (!auth) return;
  const subscriptions = readJson(SUBSCRIPTIONS_FILE);
  const index = subscriptions.findIndex(sub => sub.id === subscriptionId && sub.userId === auth.user.id);
  if (index === -1) {
    sendJson(res, 404, { error: 'Subscription not found' });
    return;
  }
  subscriptions[index].active = !subscriptions[index].active;
  subscriptions[index].updatedAt = new Date().toISOString();
  writeJson(SUBSCRIPTIONS_FILE, subscriptions);
  sendJson(res, 200, { subscription: subscriptions[index] });
}

function handleDeleteSubscription(req, res, subscriptionId) {
  const auth = authenticate(req, res);
  if (!auth) return;
  const subscriptions = readJson(SUBSCRIPTIONS_FILE);
  const index = subscriptions.findIndex(sub => sub.id === subscriptionId && sub.userId === auth.user.id);
  if (index === -1) {
    sendJson(res, 404, { error: 'Subscription not found' });
    return;
  }
  subscriptions.splice(index, 1);
  writeJson(SUBSCRIPTIONS_FILE, subscriptions);
  sendJson(res, 200, { message: 'Subscription removed' });
}

function handleExportSubscriptions(req, res) {
  const auth = authenticate(req, res);
  if (!auth) return;
  const subscriptions = readJson(SUBSCRIPTIONS_FILE).filter(sub => sub.userId === auth.user.id);
  const payload = {
    generatedAt: new Date().toISOString(),
    count: subscriptions.length,
    subscriptions
  };
  const buffer = Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': 'attachment; filename="subscriptions-export.json"',
    'Content-Length': buffer.length,
    'Access-Control-Allow-Origin': '*'
  });
  res.end(buffer);
}

function routeApi(req, res, pathname) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    });
    res.end();
    return true;
  }
  if (pathname === '/api/register' && req.method === 'POST') {
    handleRegister(req, res);
    return true;
  }
  if (pathname === '/api/login' && req.method === 'POST') {
    handleLogin(req, res);
    return true;
  }
  if (pathname === '/api/logout' && req.method === 'POST') {
    handleLogout(req, res);
    return true;
  }
  if (pathname === '/api/user' && req.method === 'GET') {
    handleGetUser(req, res);
    return true;
  }
  if (pathname === '/api/user' && req.method === 'PATCH') {
    handleUpdateUser(req, res);
    return true;
  }
  if (pathname === '/api/subscriptions' && req.method === 'GET') {
    handleListSubscriptions(req, res);
    return true;
  }
  if (pathname === '/api/subscriptions' && req.method === 'POST') {
    handleCreateSubscription(req, res);
    return true;
  }
  if (pathname.startsWith('/api/subscriptions/') && req.method === 'PUT') {
    const id = Number(pathname.split('/')[3]);
    handleUpdateSubscription(req, res, id);
    return true;
  }
  if (pathname.startsWith('/api/subscriptions/') && req.method === 'PATCH') {
    const id = Number(pathname.split('/')[3]);
    handleToggleSubscription(req, res, id);
    return true;
  }
  if (pathname.startsWith('/api/subscriptions/') && req.method === 'DELETE') {
    const id = Number(pathname.split('/')[3]);
    handleDeleteSubscription(req, res, id);
    return true;
  }
  if (pathname === '/api/subscriptions/export' && req.method === 'GET') {
    handleExportSubscriptions(req, res);
    return true;
  }
  return false;
}

function serveStatic(req, res, pathname) {
  const filePath = getFilePath(pathname);
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    } else {
      sendFile(res, filePath);
    }
  });
}

function getFilePath(pathname) {
  if (pathname === '/' || pathname === '') {
    return path.join(PUBLIC_DIR, 'index.html');
  }
  const relativePath = pathname.replace(/^\/+/, '');
  const safePath = path.normalize(path.join(PUBLIC_DIR, relativePath));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    return null;
  }
  let target = safePath;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, 'index.html');
  }
  return target;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';

  if (routeApi(req, res, pathname)) {
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
