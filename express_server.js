const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;
//remember to edit the POST /edit, and change the :shortURL to :id
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
  
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,//后者取值被放入到前者变量中，然后被render页面用<%=%>取得，如果render页面
    //直接调用id是无法调用的，因为是放入这边的templateVars变量中整体放到render页面中的；
    longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
  
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  //此处只要保持变量名一致就行，也就是urls的id和paramas.id都是id，那么render页面的post，不管是什么值
  //传回的时候，都会按照设置好的post来处理；
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

