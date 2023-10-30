if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const MongoStore = require("connect-mongo");

// const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);

});

async function main() {
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

store.on("error", () => {
    console.log("Error in mongo session store", error);
})

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const user = require("./routes/user.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");
const { error } = require("console");


app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


//Middleware for flashing the messages
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listing", listings);
app.use("/listing/:id/reviews", reviews);
app.use("/", user);

// app.get("/listing",async (req,res)=>{
//     const sampleListing=new Listing({
//         title:"My new Villa",
//         description:"Near the beach",
//         price:12000,
//         location:"Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     res.send("Testing is successful and the new document is saved to the collection wanderlust");
// });

app.all("*", (req, res, next) => {
    throw new ExpressError(404, "Page not found");
});

app.use((err, req, res, next) => {
    let { status = 500, message = "some error has occurred" } = err;
    // res.status(status).send(message);
    // We can also render here an error template file so to make our error more clear.
    console.log(err);
    res.status(status).render("listings/error.ejs", { message });
});
app.listen(8080, (req, res) => {
    console.log("App is listening to port 8080");
});