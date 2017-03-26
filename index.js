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
      var options = {
        threshold: 0.2,
        keys: ["name"]
        };
      var fuse_family = new Fuse(language_data, options)
      var result1 = fuse_family.search(language)
      if(result1.length>0){
        console.log(JSON.stringify(result1, null, "  "));
      }else{
        language_data.some(function(family){
          var fuse_branch = new Fuse(family.branch, options)
          var result2 = fuse_branch.search(language)
          if(result2.length>0){
            console.log(JSON.stringify(result2, null, "  "));
            return true;
          }else{
            var foundALanguage = false;
            family.branch.some(function(branch){
              var fuse_language = new Fuse(branch.language, options)
              var result3 = fuse_language.search(language)
              if(result3.length>0){
                console.log(JSON.stringify(result3, null, "  "));
                foundALanguage = true;
                return true;
              }
            });
          }
          return foundALanguage;
          console.log("Sorry, I can't find anything. Please try again;");
        });
      }
      // console.log(JSON.stringify(language_data, null, '  '));
    })
    .catch(function(err){
      if(err)throw err;
    });
}

// languageFacts("Yue");

function CountryLanguage(name, status){
  this.name = name;
  this.status = status;
}

function CountryRecord(name){
  this.name = name;
  this.language = [];
}

CountryRecord.prototype.addLanguage = function(name, status){
  this.language.push(new CountryLanguage(name, status));
}

function countryfacts(country){
  loadDataPromise()
    .then(function(language_data){
      var options = {
        threshold: 0.2,
        keys: ["name"]
        };
      var record = new CountryRecord(country);
      language_data.forEach(function(family){
        var fuse_family = new Fuse(family.country, options)
        var results1 = fuse_family.search(country)
        results1.forEach(function(result){
          record.addLanguage(family.name, result.status);
        });
      });
      language_data.forEach(function(family){
        family.branch.forEach(function(branch){
          var fuse_branch = new Fuse(branch.country, options)
          var results2 = fuse_branch.search(country)
          results2.forEach(function(result){
            record.addLanguage(branch.name, result.status);
          });
        });
      });
      language_data.forEach(function(family){
        family.branch.forEach(function(branch){
          branch.language.forEach(function(language){
            var fuse_language = new Fuse(language.country, options)
            var results3 = fuse_language.search(country)
            results3.forEach(function(result){
              record.addLanguage(language.name, result.status);
            });
          });
        });
      });
      var importance_array = ["de facto", "national", "official", "co-official", "unofficial", "majority", "regional", "in", "significant minority", "recognized minority", "minority"]
      function compare(a, b){
      var status_level_a = importance_array.indexOf((a.status.split(" "))[0].toLowerCase().replace(",", ""));
      var status_level_b = importance_array.indexOf((b.status.split(" "))[0].toLowerCase().replace(",", ""));
      if(status_level_a === -1){
        status_level_a = 1000;
      }
      if(status_level_b === -1){
        status_level_b = 1000;
      }
      return status_level_a - status_level_b
      }

      record.language = record.language.sort(compare);
      console.log(record.language);
      if(record === undefined){
        console.log("Sorry, I can't find anything. Please try again;")
      }
    })
    .catch(function(err){
      if(err)throw err;
    });
}

countryfacts("china");
