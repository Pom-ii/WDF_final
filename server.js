//GLOBAL DEFINITIONS
const adminName = "Pom";
//const adminPassword = "420";
const adminPassword =
  "$2b$12$K27VUspufFfW4HscAXGYR.xpNAw9YYDNijCd0fKGOtjjiYJX4g/jm";

const bcrypt = require("bcrypt");
const saltRounds = 12;
const express = require("express");
const sqlite3 = require("sqlite3");
const session = require("express-session");
const connectSqlite3 = require("connect-sqlite3");
const port = 8080;
const app = express();
const { engine } = require("express-handlebars");
//DATABASE
const dbFile = "WDF-final.db";
db = new sqlite3.Database(dbFile);

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
app.use((req, res, next) => {
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

app.post("/game/new", (req, res) => {
  const name = req.body.gamename;
  const year = req.body.gameyear;
  const desc = req.body.gamedesc;
  const url = req.body.gameurl;

  db.run(
    "INSERT INTO games (gname, gyear, gdesc, gurl) VALUES (?, ?, ?, ?)",
    [name, year, desc, url],
    (error) => {
      if (error) {
        console.log("Error when trying to add game: " + error);
        res.redirect("/games");
      } else {
        console.log("Line added to games");
        res.redirect("/games");
      }
    }
  );
});

app.post("/game/modify/:gameid", (req, res) => {
  const id = req.params.gameid;
  const name = req.body.gamename;
  const year = req.body.gameyear;
  const desc = req.body.gamedesc;
  const url = req.body.gameurl;

  db.run(
    "UPDATE games SET gname=?, gyear=?, gdesc=?, gurl=? WHERE gid=?",
    [name, year, desc, url, id],
    (error) => {
      if (error) {
        console.log("ERROR updating games: " + error);
        res.redirect("/games");
      } else {
        res.redirect("/games");
      }
    }
  );
});
//--------------------------------------------------------------------------

//ROUTES
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/games", (req, res) => {
  db.all("SELECT * FROM games", (error, listOfGames) => {
    if (error) {
      console.log("ERROR: ", error);
    } else {
      model = { games: listOfGames };
      res.render("games", model);
    }
  });
});

app.get("/game/new", (req, res) => {
  console.log("clicked on add new game");
  res.render("new-game");
});

app.get("/game/:gameid", (req, res) => {
  db.get(
    "SELECT * FROM games WHERE gid=?",
    [req.params.gameid],
    (error, theGame) => {
      if (error) {
        console.log("ERROR: " + error);
      } else {
        const model = {
          game: theGame,
        };
        res.render("game", model);
      }
    }
  );
});

app.get("/game/delete/:gameid", (req, res) => {
  db.run("DELETE FROM games WHERE gid=?", [req.params.gameid], (error) => {
    if (error) {
      console.log("ERROR couldn't delete game: " + error);
    } else {
      console.log("The game" + req.params.gameid + " has been deleted...");
      res.redirect("/games");
    }
  });
});

app.get("/game/modify/:gameid", (req, res) => {
  const id = req.params.gameid;
  db.get("SELECT * FROM games WHERE gid =?", [id], (error, theGame) => {
    if (error) {
      console.log("ERROR trying to modify game: " + error);
      res.redirect("/games");
    } else {
      model = { game: theGame };
      res.render("new-game", model);
    }
  });
});

app.get("/consoles", (req, res) => {
  db.all("SELECT * FROM consoles", (error, listOfConsoles) => {
    if (error) {
      console.log("ERROR: ", error);
    } else {
      model = { consoles: listOfConsoles };
      res.render("consoles", model);
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Couldn't destroy session: " + err);
    } else {
      console.log("Logged out succesfully");
      res.redirect("/");
    }
  });
});

//VIDEO GAMES DATABASE
function initTableGames(anyDb) {
  const games = [
    {
      id: "0",
      name: "Bioshock",
      desc: "In 1960, the protagonist, Jack, is a passenger on a plane that crashes in the Atlantic Ocean. The only survivor, Jack makes his way to a nearby lighthouse; inside is a bathysphere that takes him to Rapture. Jack is contacted via radio by Atlas, who helps guide him through the ruined city.",
      year: 2007,
      url: "/img/counting.png",
    },
    {
      id: "1",
      name: "Omori",
      desc: "In this game, you play as OMORI, a young man in black and white, who goes to visits his friends when he finds out his best friend, Basil, disappeared the previous day.",
      year: 2020,
      url: "/img/medical.png",
    },
    {
      id: "2",
      name: "Prey",
      desc: "Morgan Yu is trapped aboard a space station filled with shape-shifting aliens with no memory of how he got there. Guided by a mysterious stranger and his former self, he must set the station's self-destruct before the aliens reach Earth.",
      year: 2017,
      url: "/img/qcm07.png",
    },
    {
      id: "3",
      name: "The Last of Us",
      desc: "In a ravaged civilization, where infected and hardened survivors run rampant, Joel, a weary protagonist, is hired to smuggle 14-year-old Ellie out of a military quarantine zone. However, what starts as a small job soon transforms into a brutal cross-country journey.",
      year: 2013,
      url: "/img/diaw02.png",
    },
    {
      id: "4",
      name: "Inscryption",
      desc: "Inscryption is an inky black card-based odyssey that blends the deckbuilding roguelike, escape-room style puzzles, and psychological horror into a blood-laced smoothie. Darker still are the secrets inscribed upon the cards.",
      year: 2021,
      url: "/img/management.png",
    },
  ];

  anyDb.run(
    "CREATE TABLE games (gid INTEGER PRIMARY KEY AUTOINCREMENT, gname TEXT NOT NULL, gdesc TEXT NOT NULL, gyear INT, gurl TEXT NOT NULL)",
    (error) => {
      if (error) {
        console.log("ERROR", error);
      } else {
        console.log("---> Table games created!");

        games.forEach((oneGame) => {
          anyDb.run(
            "INSERT INTO games (gid, gname, gdesc, gyear, gurl) VALUES (?, ?, ?, ?, ?)",
            [oneGame.id, oneGame.name, oneGame.desc, oneGame.year, oneGame.url],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("Line added into the games table!");
              }
            }
          );
        });
      }
    }
  );
}
//CONSOLES DATABASE
function initTableConsoles(anyDb) {
  const consoles = [
    {
      id: "00",
      name: "Playstation 3",
      year: 2006,
      brand: "Sony",
    },
    {
      id: "01",
      name: "PC",
      year: 1962,
      brand: "any",
    },
    {
      id: "02",
      name: "Xbox 360",
      year: 2005,
      brand: "Microsoft",
    },
    {
      id: "03",
      name: "Nintendo Switch",
      year: 2017,
      brand: "Nintendo",
    },
    {
      id: "04",
      name: "Steam Deck",
      year: 2022,
      brand: "Valve",
    },
  ];

  anyDb.run(
    "CREATE TABLE consoles (cid INTEGER PRIMARY KEY AUTOINCREMENT, cname TEXT NOT NULL, cyear INT, cbrand TEXT NOT NULL)",
    (error) => {
      if (error) {
        console.log("ERROR", error);
      } else {
        console.log("---> Table consoles created!");

        consoles.forEach((oneConsole) => {
          anyDb.run(
            "INSERT INTO consoles (cid, cname, cyear, cbrand) VALUES (?, ?, ?, ?)",
            [oneConsole.id, oneConsole.name, oneConsole.year, oneConsole.brand],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("Line added into the consoles table!");
              }
            }
          );
        });
      }
    }
  );
}

// LISTEN
app.listen(port, function () {
  //initTableGames(db);
  //initTableConsoles(db);
  console.log("Server up and running, listening on port " + `${port}` + " ...");
});
