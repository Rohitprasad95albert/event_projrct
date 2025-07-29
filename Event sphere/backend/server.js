const express = require('express')
const app = express();
const cors = require('cors');
const db = require('./db');
require('dotenv').config();
//const passport = require('./middleware/auth');

// Or, allow only your frontend origin:
app.use(cors({ origin: 'http://127.0.0.1:5500' ,
    credentials: true
}));

// Then your routes
app.post('/api/auth/login', (req, res) => {
  // login logic
});
const bodyParser = require('body-parser');
app.use(bodyParser.json()); //req.body
const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/auth');
//const {verifyToken} = require('./middleware/auth');
const eventRoutes = require('./routes/events');
const certRoutes = require('./routes/certificates');
const analyticsRoutes = require('./routes/analytics');
const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);

app.use('/api/analytics', analyticsRoutes);

app.use('/api/certificates', certRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/events',eventRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
