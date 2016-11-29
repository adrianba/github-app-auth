"use strict";

var GitHubApi = require("github");
var github = new GitHubApi({
    //debug: true,
    protocol: "https",
    timeout: 5000
});

var GitHubConfig = {};

function auth(config) {
  if(!config || !config.client_id || !config.client_secret || !config.scopes) {
    throw "Invalid GitHubAuth configuration";
  }
  GitHubConfig = config;
  return auth;
}

auth.registerUser = function(userInfo) {
    return new Promise((resolve,reject) => {
        github.authenticate({type:"basic", username:userInfo.user, password:userInfo.password});
        var headers = userInfo.code ? { "X-GitHub-OTP":userInfo.code } : { };
        github.authorization.create({ scopes:GitHubConfig.scopes, client_id:GitHubConfig.client_id, client_secret:GitHubConfig.client_secret, headers },(err,res) => {
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
};

module.exports = auth;