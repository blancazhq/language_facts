var request = require("request-promise");
var cheerio = require("cheerio");
var Promise = require("bluebird");
var fs = require("fs-promise");
var path = require("path");
var url = "https://en.wikipedia.org/wiki/List_of_countries_by_spoken_languages"

function Languagefamily(name){
  this.type = "Language Family"
  this.name = name;
  this.branch = [];
  this.country = [];
  this.language = [];
}

function Branch(name){
  this.type = "Language Branch"
  this.name = name;
  this.language = [];
  this.country = [];
}

function Language(name){
  this.type = "Language"
  this.name = name;
  this.country = [];
}

function Country(name, status){
  this.name = name;
  this.status = status;
}

var languages = [];
var family_counter = -1;
var branch_counter = -1;
var language_counter = -1;

function nextElement(element){
  if(element.is("h2")){
   if($(element).children(".mw-headline").children("a").text()){
     var newfamily = new Languagefamily($(element).children(".mw-headline").children("a").text());
     languages.push(newfamily);
     family_counter ++;
     branch_counter = -1;
     language_counter = -1;
   }
  }
  else if(element.is("h3")){
    if($(element).children(".mw-headline").children("a").text()){
      var newbranch = new Branch($(element).children(".mw-headline").children("a").text());
      languages[family_counter]["branch"].push(newbranch);
      branch_counter ++;
      language_counter = -1;
    }else if($(element).children(".mw-headline").text()){
      var newbranch = new Branch($(element).children(".mw-headline").text());
      languages[family_counter]["branch"].push(newbranch);
      branch_counter ++;
      language_counter = -1;
    }
  }else if(element.is("h4")){
    if($(element).children(".mw-headline").children("a").text()){
      var newlanguage = new Language($(element).children(".mw-headline").children("a").text());
      languages[family_counter]["branch"][branch_counter]["language"].push(newlanguage);
      language_counter ++;
    }
  }else if(element.is("table")){
    nextTableElement(element.children("tr").eq(1));
  }else if(element.html() == null){
    return;
  }
  nextElement(element.next())
}

function nextTableElement(element){
  if(element.html() == null){
    return;
  }else if($(element).parent().children().eq(0).children().eq(0).text()==="Language"&&$(element).children("td").eq(2).html()!==null){
    if($(element).children("td").children("b").children("a").eq(0).html()!==null){
      var newlanguage = new Language($(element).children("td").children("b").children("a").eq(0).text());
    }else{
      var newlanguage = new Language($(element).children("td").children("a").eq(0).text());
    }
    language_counter ++;
    var newcountry = new Country($(element).children("td").children(".flagicon").next().text(), $(element).children("td").children(".flagicon").parent().next().text());
    newlanguage.country.push(newcountry)
    if(branch_counter != -1){
      languages[family_counter]["branch"][branch_counter]["language"].push(newlanguage);
    }else{
      languages[family_counter]["language"].push(newlanguage);
    }
  }else if($(element).parent().children().eq(0).children().eq(0).text()==="Language"&&$(element).children("td").eq(2).html()===null){
    if($(element).children("td").children(".flagicon").next().html()===null){
      return;
    }else{
      var newcountry = new Country($(element).children("td").children(".flagicon").next().text(), $(element).children("td").children(".flagicon").parent().next().text());
      if(branch_counter != -1){
        languages[family_counter]["branch"][branch_counter]["language"][language_counter]["country"].push(newcountry);
      }else{
        languages[family_counter]["language"][language_counter]["country"].push(newcountry);
      }
    }
  }else{
    if($(element).children("td").children(".flagicon").next().text()){
      if(element.parent().prev().is("h2")||(element.parent().prev().is("div")&&element.parent().prev().prev().is("h2"))){
        var newcountry = new Country($(element).children("td").children(".flagicon").next().text(), $(element).children("td").children(".flagicon").parent().next().text());
        languages[family_counter]["country"].push(newcountry);
      }else if(element.parent().prev().is("h3")||(element.parent().prev().is("div")&&element.parent().prev().prev().is("h3"))){
        var newcountry = new Country($(element).children("td").children(".flagicon").next().text(), $(element).children("td").children(".flagicon").parent().next().text());
        languages[family_counter]["branch"][branch_counter]["country"].push(newcountry);
      }else if(element.parent().prev().is("h4")||(element.parent().prev().is("div")&&element.parent().prev().prev().is("h4"))){
        var newcountry = new Country($(element).children("td").children(".flagicon").next().text(), $(element).children("td").children(".flagicon").parent().next().text());
        languages[family_counter]["branch"][branch_counter]["language"][language_counter]["country"].push(newcountry);
      }
    }
  }
  nextTableElement(element.next())
}

function FindAndProcess(data){
  return new Promise (function(resolve, reject){
    nextElement($("h2").eq(1));
    resolve(languages);
  })
}

function loadData(){
  return new Promise (function(resolve, reject){
    request.get(url)
      .then(function(html){
        $ = cheerio.load(html);
        return FindAndProcess(html)
      })
      .then(function(language){
        var languages_json = JSON.stringify(languages, null, '  ');
        return fs.writeFile(path.join(__dirname, "language.json"),languages_json);
      })
      .then(function(){
        resolve();
      })
      .catch(function(err){
        console.log(err.message)
      })
  })
}

module.exports = loadData;
