const User = require("../models/user.js");

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.SignUp = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = await new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        // Now we want to automatically login the user who has signed up 
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listing");
        })
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/listing");
    }
};

module.exports.renderLogInForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.LogIn = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || '/listing';
    res.redirect(redirectUrl);
};

module.exports.LogOut = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been successfully logged out!")
        res.redirect("/listing");
    });
};