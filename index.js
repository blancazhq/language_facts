// 1. find whether a language is a family, a branch or a language
// 2. find which country speak the language, and the status of the language in the country
// 3. find all the languages or major languages that a certain country speak

var path = require("path");
var Promise = require("bluebird")
var Fuse = require("fuse.js")
var loadData = require(path.join(__dirname, "loaddata.js"));
var _ = require("lodash");


function loadDataPromise(){
  return new Promise(function(resolve, reject){
    loadData()
    .then(function(){
      return new Promise(function(resolve, reject){
        var language_data = require(path.join(__dirname, "language.json"));
        resolve(language_data);
      })
    })
    .then(function(language_data){
      resolve(language_data);
    })
  });
}

function languagefacts(language){
  return new Promise(function(resolve, reject){
    loadDataPromise()
      .then(function(language_data){
        var options = {
          threshold: 0.2,
          keys: ["name"]
          };
        var fuse_family = new Fuse(language_data, options)
        var result1 = fuse_family.search(language)
        if(result1.length>0){
          result = JSON.stringify(result1, null, "  ")
        }else{
          language_data.some(function(family){
            var fuse_branch = new Fuse(family.branch, options)
            var result2 = fuse_branch.search(language)
            if(result2.length>0){
              result = JSON.stringify(result2, null, "  ");
              return true;
            }else{
              var foundALanguage = false;
              family.branch.some(function(branch){
                var fuse_language = new Fuse(branch.language, options)
                var result3 = fuse_language.search(language)
                if(result3.length>0){
                  var result = JSON.stringify(result3, null, "  ");
                  foundALanguage = true;
                  return true;
                }
              });
            }
            result = "Sorry, I can't find anything. Please try again";
          });
        }
        return result;
      })
      .then(function(result){
        resolve(result);
      })
  });
}

exports.languagefacts = languagefacts



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
  return new Promise(function(resolve, reject){
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
          family.language.forEach(function(language){
            var fuse_language = new Fuse(language.country, options)
            var results3 = fuse_language.search(country)
            results3.forEach(function(result){
              record.addLanguage(language.name, result.status);
            });
          });
        });
        language_data.forEach(function(family){
          family.branch.forEach(function(branch){
            branch.language.forEach(function(language){
              var fuse_language = new Fuse(language.country, options)
              var results4 = fuse_language.search(country)
              results4.forEach(function(result){
                record.addLanguage(language.name, result.status);
              });
            });
          });
        });
        var importance_array = ["de", "national", "official", "co-official", "unofficial", "not", "majority", "regional", "in", "significant", "recognized", "minority"]
        function compare(a, b){
        var status_level_a = importance_array.indexOf((a.status.split(" "))[0].toLowerCase().replace(",", "").replace(/(\[)?\d{1,2}(\])?/g, ""));
        var status_level_b = importance_array.indexOf((b.status.split(" "))[0].toLowerCase().replace(",", "").replace(/(\[)?\d{1,2}(\])?/g, ""));
        if(status_level_a === -1){
          status_level_a = 1000;
        }
        if(status_level_b === -1){
          status_level_b = 1000;
        }
        return status_level_a - status_level_b
        }
        record.language = record.language.sort(compare);
        record.language = _.uniqBy(record.language, "name");
        return record;
        if(record === undefined){
          return "Sorry, I can't find anything. Please try again"
        }
      })
      .then(function(record){
        resolve(record);
      })
  });
}

exports.countryfacts = countryfacts
