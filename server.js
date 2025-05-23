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

app.enable('trust proxy')

//registring the session and cookies andd cors(for security and other features) and the router and starting the derver on a port port middlewares
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, maxAge: 1000 * 60 * 60 * 48, httpOnly:true
  },
}))

app.use(cookieParser());


app.use((req, res, next) => {
  if (req.body && req.body.sessionid) {
    req.sessionID = req.body.sessionid
  }    
  next()
})



app.use(cors({
  origin: 'https://chopain-front.vercel.app', // Allow all origins
  credentials: true,
  methods: ['*'],
}));

// Handle preflight requests
app.options('*', cors({
  origin: 'https://chopain-front.vercel.app', // Allow all origins
  credentials: true,
  methods: ['*'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(rout)

app.listen(process.env.PORT, () => {
  console.log(`Application server listening at http://localhost:${process.env.PORT}`);
});
