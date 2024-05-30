require('dotenv').config()

const express = require('express');
const app = express();
const session = require('express-session');
const rout = require('./routes/router');
const MySQLStore = require('express-mysql-session')(session);
const db = require("./config/db")
const cors = require('cors')
const cookieParser = require('cookie-parser');

app.use(express.json());

const sessionStore = new MySQLStore({}, db);

//registring the session and cookies andd cors(for security and other features) and the router and starting the derver on a port port middlewares
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 48, sameSite: 'none'
  },
}))


app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST'],
}));

// Handle preflight requests
app.options('*', cors({
  origin: 'http://localhost:5173', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(rout)

app.listen(process.env.PORT, () => {
  console.log(`Application server listening at http://localhost:${process.env.PORT}`);
});
