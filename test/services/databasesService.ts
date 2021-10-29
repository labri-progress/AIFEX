import mongoose from "mongoose";


export async function dropAllDatabases() {
    let conn;
    conn = await mongoose.connect('mongodb://localhost/DEVaccountDB');
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close();
    
    conn = await mongoose.connect('mongodb://localhost/DEVobjectiveDB');
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close();
    
    conn = await mongoose.connect('mongodb://localhost/DEVwebsiteDB');
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close();
    
    conn = await mongoose.connect('mongodb://localhost/DEVmodelDB');
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close();
}