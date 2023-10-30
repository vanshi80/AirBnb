const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const ListingController = require("../controller/user.js");

router.route("/signup")
    .get(ListingController.renderSignUpForm)
    .post(wrapAsync(ListingController.SignUp));

router.route("/login")
    .get(ListingController.renderLogInForm)
    // here passport has an inbuilt func authenticate that automatically authenitcates the user if he or she is already signed up 
    // then only he will successfully logged in otherwise will be again redirected to login page
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), ListingController.LogIn)

// LogOut
router.get("/logout", ListingController.LogOut);

module.exports = router;