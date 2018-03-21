const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const port = 3000;

const app = express();

//Middlewares

//views
app.set("view engine", "jsx");
app.set("views", path.join(__dirname, "views"));
app.engine('jsx', require('express-react-views').createEngine());

//public directory
app.use(express.static(path.join(__dirname + "public")));

//end Middlewares

//Routes
app.get('/', (req, res) => {
  res.render("index", {
    text: "testing"
  });
});

//starting the server
app.listen(port, () => {
  console.log("Server started on port 3000...")
});
