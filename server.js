//GLOBAL DEFINITIONS
const adminName = "Pom";
const adminPassword = "420";
//const adminPassword ="";

const bcrypt = require("bcrypt");
const saltRounds = 12;
const express = require("express");
const sqlite3 = require("sqlite3");
const session = require("express-session");
const connectSqlite3 = require("connect-sqlite3");
const port = 8080;
const app = express();
const { engine } = require("express-handlebars");

// code for hashing password
/* bcrypt.hash(adminPassword, saltRounds, function (err, hash) {
  if (err) {
    console.log("---> Error encrypting the password: ", err);
  } else {
    console.log("---> Hashed password: ", hash);
  }
}); */

//MIDDLEWARES---------------------------------------------------------------
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//HANDLEBARS
app.engine(
  "handlebars",
  engine({
    helpers: {
      eq: function (a, b) {
        return a == b;
      },
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./views");
app.set("public", "./public");

//SESSIONS
const SQLiteStore = connectSqlite3(session);
app.use(
  session({
    store: new SQLiteStore({ db: "session-db.db" }),
    saveUninitialized: false,
    resave: false,
    secret: "Is3this78@supposed77877to12be#encrypted?",
  })
);
//pass session on to other routes
app.use(function (req, res, next) {
  //console.log("Session passed to response locals...");
  res.locals.session = req.session;
  next();
});

//POST METHODS
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const model = {
      error: "Username & Password are required >:[",
      message: "",
    };
    return res.status(400).render("login", model);
  }
  if (username === adminName) {
    /* if (password === adminPassword) {
        const model = { error: "", message: "My Lord! Welcome back." };
        res.render("login", model);
      } else {
        const model = {
          error: "Kwitten, pwease twy agwain, I know you can do it...",
          message: "",
        };
        res.status(400).render("login", model);
      } */

    bcrypt.compare(password, adminPassword, (err, result) => {
      if (err) {
        const model = {
          error: "Error while comparing passwords: " + err,
          message: "",
        };
        res.render("login", model);
      }

      if (result) {
        //save in session
        req.session.isAdmin = true;
        req.session.isLoggedIn = true;
        req.session.name = username;
        console.log("Session info: " + JSON.stringify(req.session));
        // build model for html
        /* const model = {
            error: "",
            message: "Admin detected, welcome Master ... wtf", 
          }; */
        res.redirect("/");
      } else {
        const model = { error: "Wring password, I'm afraid...", message: "" };
        res.status(400).render("login", model);
      }
    });
  } else {
    const model = {
      error: "Sowwy bwut this is not my wittwe kwitten... Leave",
      message: "",
    };
    res.render("login", model);
  }
});

app.post("/project/new", function (req, res) {
  const name = req.body.projname;
  const year = req.body.projyear;
  const desc = req.body.projdesc;
  const type = req.body.projtype;
  const url = req.body.projurl;

  db.run(
    "INSERT INTO projects (pname, pyear, pdesc, ptype, purl) VALUES (?, ?, ?, ?, ?)",
    [name, year, desc, type, url],
    (error) => {
      if (error) {
        console.log("Error when trying to create project: " + error);
        res.redirect("/projects");
      } else {
        console.log("Line added to projects");
        res.redirect("/projects");
      }
    }
  );
});

app.post("/project/modify/:projid", function (req, res) {
  const id = req.params.projid;
  const name = req.body.projname;
  const year = req.body.projyear;
  const desc = req.body.projdesc;
  const type = req.body.projtype;
  const url = req.body.projurl;

  db.run(
    "UPDATE projects SET pname=?, pyear=?, pdesc=?, ptype=?, purl=? WHERE pid=?",
    [name, year, desc, type, url, id],
    (error) => {
      if (error) {
        console.log("ERROR updating projects: " + error);
        res.redirect("/projects");
      } else {
        res.redirect("/projects");
      }
    }
  );
});
//--------------------------------------------------------------------------

//ROUTES
app.get("/", function (req, res) {
  const model = {
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  };
  //console.log("---> Home model: " + JSON.stringify(model));
  res.render("home", model);
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/logout", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log("Couldn't destroy session: " + err);
    } else {
      console.log("Logged out succesfully");
      res.redirect("/");
    }
  });
});

// LISTEN
app.listen(port, function () {
  console.log("Server up and running, listening on port " + `${port}` + " ...");
});
