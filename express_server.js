const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');


const app = express();
const PORT = 8080;
//remember to edit the POST /edit, and change the :shortURL to :id
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// const urldb = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urldb = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW"},
  i3BoGr: { longURL: "https://www.google.ca", userID: "dasljd"}
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
}

function generateRandomString() {
  return Math.random().toString(36).substring(2,8)
};

function userValidation(input, req) {

  for(let u in usersdb) {

    if(usersdb[u][input] === req.body[input]) {//即便是调用了u在usersD，注意如果还是dot notation，还是会直接调用值email/pw，而不是变量email/pw;
      return usersdb[u];//return the whole obj.
    }

  } return undefined;
};

function urlsForUser(id) {
  let urlsobj = {};
  for (let shorturl in urldb) {

    if(urldb[shorturl].userID === id) {

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
})

app.get("/hello", (req, res) =>{
  res.send("<html><body><b>Hail Hydra!</b></body></html>")
})

app.get("/urls",(req, res) => {
  const urlsEachUser = urlsForUser(req.cookies.user_id);
  if(usersdb[req.cookies.user_id]) {
    let templateVars = {
      user_id: usersdb[req.cookies["user_id"]],
      urls: urlsEachUser 
    };
    res.render("urls_index", templateVars)
  } else {
    res.redirect("/login");
  }

});

app.get("/register", (req, res) => {
  const urlsEachUser = urlsForUser(req.cookies.user_id);
  let templateVars = {
    user_id: usersdb[req.cookies["user_id"]],//如果先.后[],js又会confuse。
    urls: urlsEachUser };
  res.render("urls_regi", templateVars)

});

app.post("/register", (req, res) => {
  const user = userValidation("email", req);
  if(req.body.email === "" || req.body.password === ""){
    res.send(400, "Empty input not acceptable.");

  } else if(user) {
    res.send(400, "Already registered.");

  } else {
    const uID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    usersdb[uID] = {//用方框，不然会直接去找名叫uID的可以，而不是一个变量；
      id: uID,
      email: req.body.email,
      password: hashedPassword
    };//记住如何给obj赋值；特别是嵌套的obj；
    res.cookie("user_id", usersdb[uID].id);
    res.redirect("/urls");
  };
});

app.get("/urls/new", (req, res) => {
  const urlsEachUser = urlsForUser(req.cookies.user_id);

  if(usersdb[req.cookies.user_id]) {
    let templateVars = {
      user_id: usersdb[req.cookies["user_id"]],
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
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${shortURL}`);
})
  
app.get("/urls/:id", (req, res) => {
  if(usersdb[req.cookies.user_id]) {
    let templateVars = {
      user_id: usersdb[req.cookies["user_id"]],
      shortURL: req.params.id,//后者取值被放入到前者变量中，然后被render页面用<%=%>取得，如果render页面
      //直接调用id是无法调用的，因为是放入这边的templateVars变量中整体放到render页面中的；
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
  if(usersdb[req.cookies.user_id]) {
    delete urldb[req.params.id];
    res.redirect("/urls");
  } else {
    res.redirect("/register");
  }

});

app.post("/urls/:id/edit", (req, res) => {
  if(usersdb[req.cookies.user_id]) {
    urldb[req.params.id].longURL = req.body.longURL;
    //此处只要保持变量名一致就行，也就是urls的id和paramas.id都是id，那么render页面的post，不管是什么值
    //传回的时候，都会按照设置好的post来处理；
    res.redirect("/urls");
  } else {
    res.redirect("/register");
  }

});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: usersdb[req.cookies["user_id"]]
  }
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => {
  const user = userValidation("email", req);
  if(user) {
    if(bcrypt.compareSync(req.body.password, user.password)){
      const user_id = user.id
      res.cookie("user_id", user_id)
      res.redirect("/urls");
    } else {
    res.send(403, "Login incorrect.")
      } 
  } else {
    res.send(403, "Wrong email.")
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

