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

//BCRYPT code for hashing password
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    //Promise so that the function returns the hash as a useable value
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) {
        console.log("---> Error encrypting the given password: ", err);
        reject(err); //reject promise with error
      } else {
        console.log("---> Hashed password: ", hash);
        resolve(hash);
      }
    });
  });
}

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
      lookup: function (obj, field) {
        return obj && obj[field];
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
    //check if either username or password are not typed in
    const model = {
      error: "Username & Password are required >:[",
      message: "",
    };
    return res.status(400).render("login", model);
  }
  if (username === adminName) {
    //compare username to user input
    bcrypt.compare(password, adminPassword, (err, result) => {
      //compare user input & admin password
      if (err) {
        //error during comparison
        const model = {
          error: "Error while comparing passwords: " + err,
          message: "",
        };
        res.render("login", model);
      }

      if (result) {
        //user input & admin password are the same
        //save in session
        req.session.isAdmin = true;
        req.session.isLoggedIn = true;
        req.session.name = username;
        console.log("Session info: " + JSON.stringify(req.session));
        res.redirect("/");
      } else {
        //user input is not the admin password
        const model = { error: "Wring password, I'm afraid...", message: "" };
        res.status(400).render("login", model);
      }
    });
  } else {
    //user input does not match admin username
    const model = {
      error: "Sowwy bwut this is not my wittwe kwitten... Leave",
      message: "",
    };
    res.render("login", model);
  }
});

app.post("/game/new", (req, res) => {
  //new game details were added and submit button pressed
  const name = req.body.gamename;
  const year = req.body.gameyear;
  const desc = req.body.gamedesc;
  const icon = req.body.gameicon;
  const big = req.body.gamebig;

  //add new record to games table (CREATE)
  db.run(
    "INSERT INTO games (gname, gyear, gdesc, gicon, gbig) VALUES (?, ?, ?, ?,?)",
    [name, year, desc, icon, big],
    (error) => {
      if (error) {
        //error log
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
  //new game details were added and submit button pressed
  const id = req.params.gameid;
  const name = req.body.gamename;
  const year = req.body.gameyear;
  const desc = req.body.gamedesc;
  const icon = req.body.gameicon;
  const big = req.body.gamebig;

  //specific record in games table is updated with new information (UPDATE)
  db.run(
    "UPDATE games SET gname=?, gyear=?, gdesc=?, gicon=?, gbig=? WHERE gid=?",
    [name, year, desc, icon, big, id],
    (error) => {
      if (error) {
        //error log
        console.log("ERROR updating games: " + error);
        res.redirect("/games");
      } else {
        res.redirect("/games");
      }
    }
  );
});

app.post("/", (req, res) => {
  let gameIds;
  let page;
  if (req.body.page1) {
    gameIds = [4, 5, 6];
    page = "page2";
  } else {
    gameIds = [1, 2, 3];
    page = "page3";
  }
  //console.log(req.body.page1);

  db.all(
    "SELECT * FROM games WHERE gid in (?, ?, ?)", //line ??? was adapted from https://stackoverflow.com/questions/2379357/what-is-the-best-way-to-select-multiple-rows-by-id-in-sql 10.10.2024
    gameIds,
    (error, listOfGames) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        model = {
          game: listOfGames,
          whichPartial: function () {
            return page;
          },
        };
        res.render("home", model);
      }
    }
  );
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    //check if either username or password are not typed in
    const model = {
      error: "Username & Password are required >:[",
      message: "",
    };
    return res.status(400).render("register", model);
  } else {
    //check if username already exists & if not, add user to table users
    db.get("SELECT * FROM users WHERE uname =?", [username], (error, row) => {
      if (error) {
        console.log("ERROR: " + error);
      } else {
        if (!row) {
          // code for registering new user in table users
          // Code generated by ChatGPT - BEGIN
          // (CHatGPT, 2024, "how to make one part of my code wait until a certain function is carried out?", https://chatgpt.com/)
          async function newUser() {
            try {
              //hash given password
              password = await hashPassword(password);
              console.log("hashes password after await: " + password);

              //insert user + hasehd password into users table
              db.run(
                "INSERT INTO users (uname, upassword, urole) values (?, ?, ?)",
                [username, password, "User"],
                (error) => {
                  if (error) {
                    //error log
                    console.log("ERROR: " + error);
                  } else {
                    console.log("New user added to users!");
                    const model = {
                      error: "",
                      message: "Account created successfully!",
                    };
                    return res.render("register", model);
                  }
                }
              );
            } catch (err) {
              console.log("Failed to hash password: " + err);
              res.redirect("/home");
            }
          }
          //add new user + hashed password to users table
          newUser();
          // Code genereated by ChatGPT - END
        } else {
          const model = {
            error: "Username is already in use :/",
            message: "",
          };
          return res.status(400).render("register", model);
        }
      }
    });
  }
});
//--------------------------------------------------------------------------

//ROUTES
app.get("/", (req, res) => {
  //render home page
  /* res.render("home"); */
  let gameIds;
  let page;
  if (req.query.page3) {
    gameIds = [4, 5, 6];
    page = "page2";
  } else {
    gameIds = [7, 8, 9];
    page = "page1";
  }
  //console.log(gameIds, req.query.page3);

  db.all(
    "SELECT * FROM games WHERE gid in (?, ?, ?)", //line 182 was adapted from https://stackoverflow.com/questions/2379357/what-is-the-best-way-to-select-multiple-rows-by-id-in-sql 10.10.2024
    gameIds,
    (error, listOfGames) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        model = {
          game: listOfGames,
          whichPartial: function () {
            return page;
          },
        };
        res.render("home", model);
      }
    }
  );
});

app.get("/about", (req, res) => {
  //render about me page
  res.render("about");
});

app.get("/contact", (req, res) => {
  //render contact page
  res.render("contact");
});

app.get("/games", (req, res) => {
  //list all records from games table & render games page (READ)
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
  //render new game page for adding a new game to the table
  console.log("clicked on add new game");
  res.render("new-game");
});

app.get("/game/:gameid", (req, res) => {
  //render specific game page (READ table)
  db.get(
    "SELECT * FROM games WHERE gid=?",
    [req.params.gameid],
    (error, theGame) => {
      if (error) {
        //error log
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
  // (DELETE) delete specific game from games table & render games page
  db.run("DELETE FROM games WHERE gid=?", [req.params.gameid], (error) => {
    if (error) {
      //error log
      console.log("ERROR couldn't delete game: " + error);
    } else {
      console.log("The game" + req.params.gameid + " has been deleted...");
      res.redirect("/games");
    }
  });
});

app.get("/game/modify/:gameid", (req, res) => {
  //render modification page to edit an existing record in games table (UPDATE)
  const id = req.params.gameid;
  db.get("SELECT * FROM games WHERE gid =?", [id], (error, theGame) => {
    if (error) {
      //error log
      console.log("ERROR trying to modify game: " + error);
      res.redirect("/games");
    } else {
      model = { game: theGame };
      res.render("new-game", model);
    }
  });
});

app.get("/consoles", (req, res) => {
  //list all records from consoles table & render games page (READ)
  db.all("SELECT * FROM consoles", (error, listOfConsoles) => {
    if (error) {
      //error log
      console.log("ERROR: ", error);
    } else {
      db.all("SELECT * FROM pairs", (error, listOfPairs) => {
        if (error) {
          //error log
          console.log("ERROR: " + error);
        } else {
          model = { consoles: listOfConsoles, pairs: listOfPairs };
          res.render("consoles", model);
        }
      });
    }
  });
});

app.get("/login", (req, res) => {
  //render login page
  res.render("login");
});

app.get("/logout", (req, res) => {
  //destroy previously logged in session and redirect to home page
  req.session.destroy((err) => {
    if (err) {
      //error log
      console.log("Couldn't destroy session: " + err);
    } else {
      console.log("Logged out succesfully");
      res.redirect("/");
    }
  });
});

app.get("/register", (req, res) => {
  //render registration page
  res.render("register");
});

//VIDEO GAMES TABLE
function initTableGames(anyDb) {
  const games = [
    {
      id: "1",
      name: "Bioshock",
      desc: "In 1960, the protagonist, Jack, is a passenger on a plane that crashes in the Atlantic Ocean. The only survivor, Jack makes his way to a nearby lighthouse; inside is a bathysphere that takes him to Rapture. Jack is contacted via radio by Atlas, who helps guide him through the ruined city.",
      year: 2007,
      icon: "/img/bioshock.jpg",
      big: "/img/bioshock_big.png",
    },
    {
      id: "2",
      name: "Omori",
      desc: "In this game, you play as OMORI, a young man in black and white, who goes to visits his friends when he finds out his best friend, Basil, disappeared the previous day.",
      year: 2020,
      icon: "/img/omori.png",
      big: "/img/omori_big.jpg",
    },
    {
      id: "3",
      name: "Prey",
      desc: "Morgan Yu is trapped aboard a space station filled with shape-shifting aliens with no memory of how he got there. Guided by a mysterious stranger and his former self, he must set the station's self-destruct before the aliens reach Earth.",
      year: 2017,
      icon: "/img/prey.png",
      big: "/img/prey_big.jpg",
    },
    {
      id: "4",
      name: "The Last of Us",
      desc: "In a ravaged civilization, where infected and hardened survivors run rampant, Joel, a weary protagonist, is hired to smuggle 14-year-old Ellie out of a military quarantine zone. However, what starts as a small job soon transforms into a brutal cross-country journey.",
      year: 2013,
      icon: "/img/tlou.png",
      big: "/img/tlou_big.png",
    },
    {
      id: "5",
      name: "Inscryption",
      desc: "Inscryption is an inky black card-based odyssey that blends the deckbuilding roguelike, escape-room style puzzles, and psychological horror into a blood-laced smoothie. Darker still are the secrets inscribed upon the cards.",
      year: 2021,
      icon: "/img/inscryption.png",
      big: "/img/inscryption_big.png",
    },
    {
      id: "6",
      name: "Resident Evil II (Remake)",
      desc: "Leon S Kennedy a rookie cop with the RPD and Claire Redfield are stuck in Raccoon City during the outbreak and have to survive the oncoming zombie hordes and track down Claire's brother Chris.",
      year: 2019,
      icon: "/img/re.png",
      big: "/img/re_big.png",
    },
    {
      id: "7",
      name: "Strange Horticulture",
      desc: "Described as an 'occult puzzle game', Strange Horticulture involves the discovery and identification of a fictitious herbarium of plants for sale to a range of mysterious and unscrupulous customers.",
      year: 2022,
      icon: "/img/sh.ico",
      big: "/img/sh_big.jpg",
    },
    {
      id: "8",
      name: "Little Nightmares",
      desc: "Set in a mysterious world, Little Nightmares follows the journey of Six, a hungry little girl who must escape the Maw, an iron vessel inhabited by monstrous, twisted beings.",
      year: 2017,
      icon: "/img/ln.ico",
      big: "/img/ln_big.jpg",
    },
    {
      id: "9",
      name: "Professor Layton and the Diaboloical Box",
      desc: "The game follows Professor Layton and his self-proclaimed apprentice Luke as they travel cross-country by train to solve the mystery behind a mysterious box that is said to kill anyone who opens it. ",
      year: 2007,
      icon: "/img/pl.png",
      big: "/img/pl_big.jpg",
    },
  ];

  anyDb.run(
    "CREATE TABLE games (gid INTEGER PRIMARY KEY AUTOINCREMENT, gname TEXT NOT NULL, gdesc TEXT NOT NULL, gyear INT, gicon TEXT NOT NULL, gbig TEXT NOT NULL)",
    (error) => {
      if (error) {
        //error log
        console.log("ERROR", error);
      } else {
        console.log("---> Table games created!");

        games.forEach((oneGame) => {
          anyDb.run(
            "INSERT INTO games (gid, gname, gdesc, gyear, gicon, gbig) VALUES (?, ?, ?, ?, ?,?)",
            [
              oneGame.id,
              oneGame.name,
              oneGame.desc,
              oneGame.year,
              oneGame.icon,
              oneGame.big,
            ],
            (error) => {
              if (error) {
                //error log
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
//CONSOLES TABLE
function initTableConsoles(anyDb) {
  const consoles = [
    {
      id: "00",
      name: "Playstation 3",
      year: 2006,
      brand: "Sony",
      game: "The Last of Us",
    },
    {
      id: "01",
      name: "PC",
      year: 1962,
      brand: "---",
      game: "Inscryption",
    },
    {
      id: "02",
      name: "Xbox 360",
      year: 2005,
      brand: "Microsoft",
      game: "Bioshock",
    },
    {
      id: "03",
      name: "Nintendo Switch",
      year: 2017,
      brand: "Nintendo",
      game: "Professor Layton and the Diaboloical Box",
    },
    {
      id: "04",
      name: "Steam Deck",
      year: 2022,
      brand: "Valve",
      game: "Omori",
    },
  ];

  anyDb.run(
    "CREATE TABLE consoles (cid INTEGER PRIMARY KEY AUTOINCREMENT, cname TEXT NOT NULL, cyear INT, cbrand TEXT NOT NULL, cgame TEXT NOT NULL)",
    (error) => {
      if (error) {
        //error log
        console.log("ERROR", error);
      } else {
        console.log("---> Table consoles created!");

        consoles.forEach((oneConsole) => {
          anyDb.run(
            "INSERT INTO consoles (cid, cname, cyear, cbrand, cgame) VALUES (?, ?, ?, ?, ?)",
            [
              oneConsole.id,
              oneConsole.name,
              oneConsole.year,
              oneConsole.brand,
              oneConsole.game,
            ],
            (error) => {
              if (error) {
                //error log
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
//PAIRS TABLE
function initTablePairs(anyDb) {
  anyDb.run(
    "CREATE TABLE IF NOT EXISTS pairs (pid INTEGER PRIMARY KEY AUTOINCREMENT, pgame TEXT NOT NULL, pconsole TEXT NOT NULL, UNIQUE(pgame, pconsole))",
    (error) => {
      if (error) {
        //error log
        console.log("ERROR", error);
      } else {
        console.log("---> Table pairs created!");

        anyDb.run(
          "INSERT INTO pairs (pgame, pconsole) SELECT games.gname, consoles.cname FROM games INNER JOIN consoles ON games.gname = consoles.cgame",
          (error) => {
            if (error) {
              //error log
              console.log("ERROR", error);
            } else {
              console.log("---> compatible pairs added into ptable pairs!");
            }
          }
        );
      }
    }
  );
}
//USERS TABLE
function initTableUsers(anyDb) {
  anyDb.run(
    "CREATE TABLE IF NOT EXISTS users (uid INTEGER PRIMARY KEY AUTOINCREMENT, uname TEXT NOT NULL, upassword TEXT NOT NULL, urole TEXT NOT NULL, UNIQUE(uname, upassword))",
    (error) => {
      if (error) {
        //error log
        console.log("ERROR", error);
      } else {
        console.log("---> Table users created!");

        anyDb.run(
          "INSERT INTO users (uid, uname, upassword, urole) values (?, ?, ?, ?)",
          [
            1,
            "Pom",
            "$2b$12$K27VUspufFfW4HscAXGYR.xpNAw9YYDNijCd0fKGOtjjiYJX4g/jm",
            "Admin",
          ],
          (error) => {
            if (error) {
              //error log
              console.log("ERROR: " + error);
            } else {
              console.log("Admin added to users table!");
            }
          }
        );
      }
    }
  );
}

// LISTEN
app.listen(port, function () {
  //initTableGames(db);
  //initTableConsoles(db);
  //initTablePairs(db);
  //initTableUsers(db);
  console.log("Server up and running, listening on port " + `${port}` + " ...");
});
