// Generated by CoffeeScript 1.6.3
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
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.session({
      secret: "keyboard cat"
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
      return req.user.username;
    } else {
      return 'notdefined';
    }
  };

  app.get("/", function(req, res) {
    return res.render("main", {
      user: req.user,
      username: getuser(req, res)
    });
  });

  app.get("/login", function(req, res) {
    res.render("partials/login", {
      user: req.user,
      message: req.session.messages
    });
  });

  app.get("/contact", function(req, res) {
    return res.render("main", {
      user: req.user
    });
  });

  app.get("/partials/login", function(req, res) {
    res.render("partials/login", {
      user: req.user,
      message: req.session.messages
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

  app.get("/dashboard", ensureAuthenticated, function(req, res) {
    res.render("partials/dashboard", {
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
      message: req.session.message
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
        return res.redirect("/#/login");
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        console.log("req.session.returnTo " + req.session.returnTo);
        if (req.session.returnTo === "/partials/upload-part") {
          return res.redirect("/");
        } else {
          return res.redirect(req.session.returnTo || "/");
        }
      });
    })(req, res, next);
  });

  app.get("/documents", ensureAuthenticated, ops.getdocuments);

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  app.listen(3000, function() {
    console.log("Express server listening on port 3000");
  });

}).call(this);

/*
//@ sourceMappingURL=app.map
*/
