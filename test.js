var lf = require("./index")

lf.languagefacts("Mandarin")
  .then(function(result){
    console.log(result);
  })
  .catch(function(err){
    if(err)throw err;
  })

lf.countryfacts("Germany")
  .then(function(result){
    console.log(result);
  })
  .catch(function(err){
    if(err)throw err;
  })
