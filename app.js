"use strict";

var port = process.env.PORT || 1337;

var client_id = process.env.GITHUB_CLIENT_ID;
var client_secret = process.env.GITHUB_CLIENT_SECRET;
var scopes = process.env.GITHUB_SCOPES.split(",");

var GitHubApi = require("github");
var github = new GitHubApi({
    //debug: true,
    protocol: "https",
    timeout: 5000
});

var express = require('express');
var bodyParser = require('body-parser');
var cacheResponseDirective = require('express-cache-response-directive');

var app = express();
app.use(bodyParser.json());
app.use(cacheResponseDirective());

app.post('/register', (req,res) => {
  res.cacheControl("no-cache");
  registerUser(req.body).then((result) => {
    res.json(result);
  });
});

app.listen(port);

function registerUser(userInfo) {
    return new Promise((resolve,reject) => {
        github.authenticate({type:"basic", username:userInfo.user, password:userInfo.password});
        var headers = userInfo.code ? { "X-GitHub-OTP":userInfo.code } : { };
        github.authorization.create({ scopes, client_id, headers },(err,res) => {
            if(err) {
                if(err.code===401) {
                    if(err.headers['x-github-otp'] && err.headers['x-github-otp'].startsWith("required;")) {
                        resolve({status:"needcode"});
                    } else {
                        resolve({status:"badauth"});
                    }
                    resolve({status:"needcode",header:err.headers['x-github-otp']});
                } else {
                    reject(err);
                }
            } else {
                resolve({status:"okay",token:res.token});
            }
        });
    });
}