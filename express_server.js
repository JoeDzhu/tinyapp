const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

app.get("/", (req, res) => {
  res.send("Hail Hydra!");
});

app.get('/urls.json', (req, res) =>{
  res.json(urlDatabase);
})

app.get('/hello', (req, res) =>{
  res.send("<html><body><b>Hail Hydra!</b></body></html>")
})

app.get("/urls",(req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_new", templateVars);
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
})
  
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
  
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username)
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

