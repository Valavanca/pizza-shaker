// file: index.js

var _ = require("lodash");
var express = require("express");
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');

var mongoose = require('mongoose');

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

                                                                  // Data base

var mongoose = require('mongoose');
var uri = 'mongodb://db_root:85z333@ds155080.mlab.com:55080/valavanca-db';
mongoose.Promise = global.Promise
mongoose.connect(uri);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var mongo_users;
db.once('open', function callback () {
  // Create user schema
  var userSchema = mongoose.Schema({
    name: String,
    password: String,
    email: String
  });
  userSchema.statics.findByIndex = function(index, cb) {
    return this.find({ id: index }, cb);
  };
  userSchema.statics.findByName = function(name, cb) {
    return this.findOne({ name: name }, cb);
  };
  userSchema.statics.ifDoubleEmail = function(email, cb) {
    return this.findOne({ email: email }, cb);
  };

  // Store users documents in a collection called "mongo_users"
  mongo_users = mongoose.model('users', userSchema);
  console.log("DB opened");
});

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  // var user = users[_.findIndex(users, {id: jwt_payload.id})];
  var user = mongo_users.findByIndex(jwt_payload.id, function (err, userArray) {
    if (err) return console.error(err);
    console.log(usersArray);
  });
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
passport.use(strategy);

                                                              // START EXPRESS
var app = express();
app.use(passport.initialize());
// parse application/x-www-form-urlencoded
// for easier testing with Postman or plain HTML forms
app.use(bodyParser.urlencoded({
  extended: true
}));

// parse application/json
app.use(bodyParser.json())

app.get("/", function(req, res) {
  res.json({message: "Express is up!"});
});

                                                                      // LOGIN
app.post("/login", function(req, res) {
  if(req.body.name && req.body.password) {
    var name = req.body.name;
    var password = req.body.password;
  }

  mongo_users.findByName(name, function (err, findUser) {
      if (err) console.log(err);
      new Promise(function(resolve, reject) {
        if(findUser === null) {
          reject("No such user found!");
        } else {
          resolve(findUser);
        }
      }).then(
        (findUser) => {
          if(findUser.password === req.body.password) {
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var payload = {id: findUser.id};
            var token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.json({message: "ok", token: token, payload: payload });
          } else {
            res.status(401).json({message:"passwords did not match"});
          }
        },
        (error) => {res.status(401).json({message: error})}
      );
  });
});
                                                                    // REGISTER
app.post("/register", function(req, res) {
  new Promise(function(resolve, reject){
    if(req.body.name && req.body.password && req.body.email) {
      var {name, password, email} = req.body;
      resolve({name, password, email});
    } else {
      reject("Invalid input data");
    }
  }).then((user)=>{
    mongo_users.ifDoubleEmail(user.email, function(err, findEmail) {
        if (err) console.log(err);
        if (!!findEmail) {
          res.status(401).json({message:"This email already exist!"});
        } else {
          var newUser = new mongo_users({
            name: user.name,
            password: user.password,
            email: user.email
          });
          newUser.save()
          res.json('New user add');
        }
      })
    }, (e)=>{res.status(401).json({'Error:': e})});
});
                                                                    // SECRET
app.get("/secret", passport.authenticate('jwt', { session: false }), function(req, res){
  res.json({message: "Success! You can not see this without a token"});
});
                                                                    // DEBAG
app.get("/secretDebug",
  function(req, res, next){
    console.log(req.get('Authorization'));
    next();
  }, function(req, res){
    res.json("debugging");
});

app.listen(3000, function() {
  console.log("Express running");
});
