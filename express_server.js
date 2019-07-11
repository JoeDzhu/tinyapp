const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const { getUserByEmail } = require("./helpers");


const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name:"session",
  keys:["dogs", "cats"]
}));

const urldb = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW"}
};

const usersdb = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = () => Math.random().toString(36).substring(2,8);

const urlsForUser = (id) => {
  
  let urlsobj = {};
  for (let shorturl in urldb) {

    if (urldb[shorturl].userID === id) {

      urlsobj[shorturl] = urldb[shorturl].longURL;
    }
  }
  return urlsobj;
};

app.get("/", (req, res) => {
  res.send("Hail Hydra!");
});

app.get("/urls.json", (req, res) =>{
  res.json(urldb);
});

app.get("/hello", (req, res) =>{
  res.send("<html><body><b>Hail Hydra!</b></body></html>");
});

app.get("/urls",(req, res) => {
  const urlsEachUser = urlsForUser(req.session.user_id);

  if (usersdb[req.session.user_id]) {

    let templateVars = {
      user_id: usersdb[req.session["user_id"]],
      urls: urlsEachUser
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }

});

app.get("/register", (req, res) => {
  const urlsEachUser = urlsForUser(req.session.user_id);

  let templateVars = {
    user_id: usersdb[req.session["user_id"]],
    urls: urlsEachUser };
  res.render("urls_regi", templateVars);

});

app.post("/register", (req, res) => {
  const user = getUserByEmail(req.body.email, usersdb);

  if (req.body.email === "" || req.body.password === "") {
    res.send(400, "Empty input is not acceptable.");

  } else if (user) {
    res.send(400, "You have already registered, try to recall your password.");

  } else if (user === undefined) {
    const uID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    usersdb[uID] = {
      id: uID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = uID;

    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  const urlsEachUser = urlsForUser(req.session.user_id);

  if (usersdb[req.session.user_id]) {
    let templateVars = {
      user_id: usersdb[req.session["user_id"]],
      urls: urlsEachUser };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urldb[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});
  
app.get("/urls/:id", (req, res) => {
  if (usersdb[req.session.user_id]) {
    let templateVars = {
      user_id: usersdb[req.session["user_id"]],
      shortURL: req.params.id,
      longURL: urldb[req.params.id].longURL};
    res.render('urls_show', templateVars);
  } else {
    res.redirect("/register");
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urldb[req.params.id].longURL;
  res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {
  if (usersdb[req.session.user_id]) {
    delete urldb[req.params.id];
    res.redirect("/urls");
  } else {
    res.redirect("/register");
  }

});

app.post("/urls/:id/edit", (req, res) => {
  if (usersdb[req.session.user_id]) {
    urldb[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/register");
  }

});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: usersdb[req.session["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, usersdb);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.send(403, "Login incorrect, did you register? Forgot email or password?");
    }
  } else {
    res.send(403, "Login incorrect, did you register? Forgot email or password?");
  }
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

