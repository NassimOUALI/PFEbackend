require('dotenv').config()

const express = require('express');
const app = express();
const session = require('express-session');
const rout = require('./routes/router');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const mail = require("./Services/mail")

app.use(express.json());

//registring the session and cookies andd cors(for security and other features) and the router and starting the derver on a port port middlewares
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,         
    saveUninitialized: false, 
    cookie: {
        maxAge: 1000*60*60*24, // sets the cookies for 24h 
    },
}))


app.use(cookieParser());

app.options('*', cors({
    origin: "https://chopain-front.vercel.app/",
    credentials: true
}));

app.use(cors({
    origin: "https://chopain-front.vercel.app/",
    credentials: true  // Allows cookies and authentication headers
}));

app.use(rout)

app.listen(process.env.PORT, () => {
    console.log(`Application server listening at http://localhost:${process.env.PORT}`);
});
