// 1. find whether a language is a family, a branch or a language
// 2. find which country speak the language, and the status of the language in the country
// 3. find all the languages or major languages that a certain country speak

var path = require("path");
var Promise = require("bluebird")
var Fuse = require("fuse.js")
var loadData = require(path.join(__dirname, "loaddata.js"));


function loadDataPromise(){
  return new Promise(function(resolve, reject){
    loadData();
    resolve();
  })
    .then(function(){
      return new Promise(function(resolve, reject){
        var language_data = require(path.join(__dirname, "language.json"));
        resolve(language_data);
      })
    })
}

function languageFacts(language){
  loadDataPromise()
    .then(function(language_data){
      var options1 = {
        threshold: 0.2,
        keys: ["name"]
        };
      var fuse_family = new Fuse(language_data, options1)
      var result1 = fuse_family.search(language)
      if(result1.length>0){
        console.log(JSON.stringify(result1, null, "  "));
      }else{
        language_data.some(function(family){
          var options2 = {
            threshold: 0.2,
            keys: ["name"]
            };
          var fuse_branch = new Fuse(family["branch"], options2)
          var result2 = fuse_branch.search(language)
          if(result2.length>0){
            console.log("find a branch");
            console.log(JSON.stringify(result2, null, "  "));
            return true;
          }else{
            var foundALanguage = false;
            language_data.some(function(family){
              family["branch"].some(function(branch){
                var options3 = {
                  threshold: 0.2,
                  keys: ["name"]
                  };
                var fuse_language = new Fuse(branch["language"], options3)
                var result3 = fuse_language.search(language)
                if(result3.length>0){
                  console.log(JSON.stringify(result3, null, "  "));
                  foundALanguage = true;
                  return true;
                }
              });
              if(foundALanguage === true){
                return true;
              }
              console.log("Sorry, I can't find anything. Please try again;");
            });
          }
        });
      }
      // console.log(JSON.stringify(language_data, null, '  '));
    })
    .catch(function(err){
      if(err)throw err;
    });
}

languageFacts("Italian");
