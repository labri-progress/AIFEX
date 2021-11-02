import mongoose from "mongoose";


export async function dropAllDatabases() {
    await mongoose.connect('mongodb://localhost/DEVaccountDB');
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    
    await mongoose.connect('mongodb://localhost/DEVobjectiveDB');
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    
    await mongoose.connect('mongodb://localhost/DEVwebsiteDB');
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    
    await mongoose.connect('mongodb://localhost/DEVmodelDB');
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
}