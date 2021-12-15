const PORT = 8090;
const express = require('express');
const app = express();

  
//app.use(bodyParser.json({limit:'50mb'}));
app.use(express.static('./static'));
//app.use(fileUpload());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });



app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}!`)
})
