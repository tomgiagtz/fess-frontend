var express = require("express");
var app = express();

//Set Port
var port = process.env.PORT || 3000;
app.use(express.static(__dirname));
//

app.get("/", function(req, res) {
  res.render("index.html");
});

app.listen(port, function() {
  console.log("Hello World");
});
