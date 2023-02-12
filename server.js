/*-----  [ Npms ] -----*/
const express = require('express')
const app = express()
app.use(express.static(__dirname + '/views'));
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require("connect-flash");
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();



/*-----  [ export files ] -----*/

let user = require('./database/user');
let dbURL = process.env.dbURL;
let secret = process.env.secret;
let port = process.env.port;

/*-----  [ Setup project ] -----*/

app.use(session({
  secret: secret,
  cookie: { path: '/', httpOnly: true, maxAge: null },
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(cookieParser())

mongoose.connect(dbURL).then((r) => console.log("connect with db")).catch((err) => { console.log(err) })

/*-----  [ Start Code ] -----*/

app.get('/', async (req, res) => {
  let data = await user.findOne({ token: req.cookies.token });
  if (data == null) {
    res.redirect('login')
    return;
  }else {
    return res.render('index.ejs', { username: data.username });
  }
})

app.get('/profile', async (req, res) => {
  res.send('soon')
})

app.post('/', async (req, res) => {
  await res.clearCookie('token');
  return res.redirect('login');
});

app.get('/login', checkAuthenticated, (req, res) => {
  return res.render('login.ejs', { messages: req.flash('error') });
})


app.post('/login', async (req, res) => {

  let userLogin = { email: req.body.email, password: req.body.password };

  let data = await user.find({});

  if ((data.find(user => user.email === userLogin.email))) {
  } else {
    req.flash('error', 'No user with that email')
    res.redirect('login')
    return;
  };

  if ((data.find(user => user.password === userLogin.password))) {
    let info = {};
    for await (const doc of user.find({ email: userLogin.email })) { info = doc; }
    res.cookie('token', info.token, { expires: new Date(new Date().getTime() + 7889400000) });
    res.redirect('/')
  } else {
    req.flash('error', 'Password incorrect')
    res.redirect('login')
    return;
  };

})



app.get('/register', checkAuthenticated, (req, res) => {
  return res.render('register.ejs', { messages: req.flash('error') });
})

app.post('/register', async (req, res) => {

  let kay = "";
  var randomkeys = "A.BCDEFGH-IJKLMNO.PQRSTUVWXYZabcdefghijk.lmnopqrstu-vwxyz01.23456789012.3456789";
  for (var y = 0; y < 30; y++) {   ///30
   kay += `${randomkeys.charAt(Math.floor(Math.random() * randomkeys.length))}`;
  }
  let userRegister = {
    id: Date.now().toString(),
    username: req.body.name,
    email: req.body.email,
    password: req.body.password,
    token: kay
  };

  let usersData = await user.find({});

  if ((usersData.find(user => user.username == userRegister.username))) {
    req.flash('error', 'This username is already in use. Try another username.')
    res.redirect('register');
    return;
  };

  if ((usersData.find(user => user.email == userRegister.email))) {
    req.flash('error', 'This email is already in use. Try another email.')
    res.redirect('register');
    return;
  };

  try {
    await new user({
      id: userRegister.id,
      username: userRegister.username,
      email: userRegister.email,
      password: userRegister.password,
      token: userRegister.token
    }).save();
    res.redirect('login')
  } catch {
    res.redirect('register')
  };
});



function checkAuthenticated(req, res, next) {
  if (req.cookies.token) {
    return res.redirect('/')
  }
  next()
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

/*
© 2021 All Rights Reserved To Mohamed Karam.
*/
