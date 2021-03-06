// Generated by CoffeeScript 1.7.1
(function() {
  var LocalStrategy, User, allowCrossDomain, app, ensureAuthenticated, express, getuser, ops, passport, path, routes;

  ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.session.returnTo = req.path;
    res.redirect("/landing");
  };

  express = require("express");

  passport = require("passport");

  LocalStrategy = require("passport-local").Strategy;

  routes = require("./routes");

  ops = require("./routes/ops");

  User = require("./User");

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy(function(username, password, done) {
    process.nextTick(function() {
      User.findByUsername(username, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: "Unknown user " + username
          });
        }
        if (user.password !== password) {
          return done(null, false, {
            message: "Invalid password"
          });
        }
        return done(null, user);
      });
    });
  }));

  path = require("path");

  app = express();

  allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return next();
  };

  app.configure(function() {
    app.set("views", __dirname + "/views");
    app.set("view engine", "ejs");
    app.use(express.logger('tiny'));
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.session({
      secret: "hizibizi kitkat"
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(allowCrossDomain);
    app.use(app.router);
    app.use(express["static"](path.join(__dirname, "public")));
    app.use(express["static"](path.join(__dirname, "bower_components")));
  });

  getuser = function(req, res) {
    if (typeof req.user !== 'undefined') {
      return req.user.name;
    } else {
      return 'notdefined';
    }
  };

  app.get("/", function(req, res) {
    return res.render("main", {
      user: req.user,
      name: getuser(req, res)
    });
  });

  app.get("/contact", function(req, res) {
    return res.render("main", {
      user: req.user
    });
  });

  app.get("/landing", function(req, res) {
    res.render("partials/landing", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/partials/landing", function(req, res) {
    res.render("partials/landing", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/about", function(req, res) {
    res.render("partials/about", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/partials/about", function(req, res) {
    res.render("partials/about", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/register", function(req, res) {
    res.render("partials/register", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/partials/register", function(req, res) {
    res.render("partials/register", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/loginfailure", function(req, res) {
    res.render("partials/loginfailure", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/partials/loginfailure", function(req, res) {
    res.render("partials/loginfailure", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/registrationResponse", function(req, res) {
    res.render("partials/registrationResponse", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/partials/registrationResponse", function(req, res) {
    res.render("partials/registrationResponse", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/inactiveResponse", function(req, res) {
    res.render("partials/inactiveResponse", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/partials/inactiveResponse", function(req, res) {
    res.render("partials/inactiveResponse", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/registrationError", function(req, res) {
    res.render("partials/registrationError", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/partials/registrationError", function(req, res) {
    res.render("partials/registrationError", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/dashboard", ensureAuthenticated, function(req, res) {
    res.render("partials/dashboard", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/invite", ensureAuthenticated, function(req, res) {
    res.render("partials/invite", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/partials/invite", function(req, res) {
    res.render("partials/invite", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/partials/:filename", ensureAuthenticated, function(req, res) {
    var filename;
    filename = req.params.filename;
    if (!filename) {
      return;
    }
    res.render("partials/" + filename, {
      user: req.user,
      message: req.session.messages
    });
  });

  app.all("/upload/**", ensureAuthenticated, ops.upload);

  app.post("/login", function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.session.messages = [info.message];
        req.loginfailed = true;
        console.log("info.message " + info.message);
        return res.redirect("/#/loginfailure");
      }
      console.log("User: %j", user);
      if (user.status === "inactive") {
        req.session.messages = "Hello " + user.name + "! Your account is not active yet. Most likely due to heavy load. Bear with us we will notify soon once we can accommodate you.";
        return res.redirect('/#/inactiveResponse');
      } else if (user.status === "deactivated") {
        req.session.messages = "Hello " + user.name + "! Your account has been deactivated. If it was not you who did it please contact us";
        return res.redirect('/#/inactiveResponse');
      } else if (user.status === "suspended") {
        req.session.messages = "Hello " + user.name + "! Your account has been temporarily suspended and undergoing an investigation. Please cooperate with us by not trying to access your account until further notice.";
        return res.redirect('/#/inactiveResponse');
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        console.log("req.session.returnTo " + req.session.returnTo);
        if (req.session.returnTo === "/partials/notification") {
          return res.redirect("/#/");
        } else if (req.session.returnTo === "/documents") {
          return res.redirect("/#/dashboard");
        } else {
          return res.redirect(req.session.returnTo || "/");
        }
      });
    })(req, res, next);
  });

  app.post("/register", function(req, res, next) {
    console.log("Registering user: " + (req.param("username")));
    console.log("Registering user's password (hehe dont keep it long here): " + (req.param("password")));
    console.log("Registering user's email: " + (req.param("email")));
    return User.registerUser(req.param("name"), req.param("username"), req.param("password"), req.param("email"), "inactive", function(error, resp) {
      var errorStr;
      console.log("/register - error " + error);
      if (!error) {
        return res.redirect('/#/registrationResponse');
      } else {
        errorStr = error.toString();
        req.session.messages = "Error: " + (errorStr.substring(errorStr.lastIndexOf(':::') + 3));
        return res.redirect('/#/registrationError');
      }
    });
  });

  app.get("/documents", ensureAuthenticated, ops.getdocuments2);

  app.get("/documents/:vs/:prt/:fid", ensureAuthenticated, ops.fileServiceMask);

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/#/");
  });

  app.listen(8000, function() {
    console.log("Express server listening on port 8000");
  });

}).call(this);
