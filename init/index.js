const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(mongoUrl);
}
// This initDb func first deletes the older data and then insert the new data into the database
const initDb = async () => {
    await Listing.deleteMany({});
    // Here we can add the owner at one time to all the listings through this one line only instead of adding this field one by one to every listing
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "653102ec722c526e69da6854" }))
    await Listing.insertMany(initData.data);
}
initDb();
