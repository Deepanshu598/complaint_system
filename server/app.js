require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('./models');
const { sequelize, Role } = models;
const userRoutes = require('./routes/users');
const complaintRoutes = require('./routes/complaints');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);

const PORT = process.env.PORT || 4000;
async function ensureRoles() {
  const roles = ['superadmin', 'approver', 'reviewer', 'user'];
  try {
    await Promise.all(roles.map(r => Role.findOrCreate({ where: { role_name: r } })));
    console.log('Roles ensured');
  } catch (err) {
    console.error('Failed ensuring roles:', err.message);
  }
}

sequelize.sync({ alter: true }).then(async () => {
  console.log('Database synced successfully');
  await ensureRoles();
  app.listen(PORT, () => console.log('Server running on port', PORT));
}).catch(err => {
  console.error('DB connection failed:');
  console.error(err);
});
