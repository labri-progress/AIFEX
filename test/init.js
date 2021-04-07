const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/modelDB", { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        mongoose.connection.db.dropDatabase()
        console.log("drop DEVmodelDB")
    })
    .then(() => mongoose.connection.close())
    .then(() => 
        mongoose.connect("mongodb://localhost:27017/websiteDB", { useUnifiedTopology: true, useNewUrlParser: true })
            .then(() => {
                mongoose.connection.db.dropDatabase()
                console.log("drop DEVwebsiteDB")
            })
            .then(() => {
                mongoose.connection.close()
            })
    )
    .then(() => 
        mongoose.connect("mongodb://localhost:27017/sessionDB", { useUnifiedTopology: true, useNewUrlParser: true })
            .then(() => {
                mongoose.connection.db.dropDatabase()
                console.log("drop DEVsessionDB")
            }).then(() => mongoose.connection.close())
    )

