// Generated by CoffeeScript 1.6.3
(function() {
  var client, lua_find_by_id, lua_find_by_username, redis, util;

  redis = require("redis");

  client = redis.createClient();

  util = require("util");

  client.on("error", function(err) {
    console.log("Error " + err);
  });

  exports.registerUser = function(username, password, email) {
    var uid;
    uid = client.incr("global:nextUserId");
    client.set("uid:" + uid + ":username", username);
    client.set("uid:" + uid + ":password", password);
    client.set("username:" + username + ":uid", uid);
    client.set("uid:" + uid + ":email", email);
  };

  lua_find_by_id = "\n  -- KEYS[1] is the supplied UID here \n  local username = redis.call('GET', \"uid:\" ..KEYS[1].. \":username\")\n  local password = redis.call('GET', \"uid:\" ..KEYS[1].. \":password\")\n  local email = redis.call('GET', \"uid:\" ..KEYS[1].. \":email\")\n  print(KEYS[1] ..\"|\".. username ..\"|\".. password ..\"|\".. email)\n  return KEYS[1] ..\"|\".. username ..\"|\".. password ..\"|\".. email\n  ";

  lua_find_by_username = "\n  -- KEYS[1] is the supplied username here \n  local uid = redis.call('GET', \"username:\" .. KEYS[1] .. \":uid\" )\n  local password = redis.call('GET', \"uid:\" ..uid.. \":password\")\n  local email = redis.call('GET', \"uid:\" ..uid.. \":email\")\n  print(uid ..\"|\".. KEYS[1] ..\"|\".. password ..\"|\".. email)\n  return uid ..\"|\".. KEYS[1] ..\"|\".. password ..\"|\".. email\n  ";

  exports.findById = function(id, fn) {
    console.log(lua_find_by_id);
    return client["eval"](lua_find_by_id, 1, "" + id, function(error, resp) {
      var arr, user;
      if (!error) {
        console.log(resp);
        arr = resp.split('|');
        user = {
          id: arr[0],
          username: arr[1],
          password: arr[2],
          email: arr[3]
        };
        if (arr[1]) {
          fn(null, user);
        } else {
          fn(new Error("User: " + username + " does not exist"));
        }
      } else {
        console.log("Error: " + error);
        fn(new Error("User: " + username + " does not exist"));
      }
    });
  };

  exports.findByUsername = function(username, fn) {
    console.log(lua_find_by_username);
    return client["eval"](lua_find_by_username, 1, "" + username, function(error, resp) {
      var arr, user;
      if (!error) {
        console.log(resp);
        arr = resp.split('|');
        user = {
          id: arr[0],
          username: arr[1],
          password: arr[2],
          email: arr[3]
        };
        if (arr[0]) {
          return fn(null, user);
        } else {
          return fn(null, null);
        }
      } else {
        console.log("Error: " + error);
        return fn(null, null);
      }
    });
  };

}).call(this);

/*
//@ sourceMappingURL=User.map
*/
