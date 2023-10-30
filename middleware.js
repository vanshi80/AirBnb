const { model } = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema, listingSchema } = require("./schema.js");

// Middleware for Schema Validation
module.exports.validateListing = (req, res, next) => {
    console.log(req.body);
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg);
    }
    else {
        next();
    }
};
// Middleware for Review Validation
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg);
    }
    else {
        next();
    }
};
// Whenver we want to add a new listing, update a listing or delete a listing then we must be logged in into the account so we created 
// a middleware for the same
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;  //we are saving this inside the redirectUrl var for the session bcz need this 
        // originalUrl to redirect to it whenver we are like trying to add a new listing and we first have to first login to our 
        // website then after logging in we need to redirect to the originalUrl we requested initially .
        req.flash("error", "Please LogIn to make any changes!");
        return res.redirect("/login");
    }
    next();
};

// since the session is automatically reset when we login successfully so to save the Url we need to create this middleware
module.exports.saveRedirectUrl = (req, res, next) => {
    // now if we have saved this redirectUrl with originalUrl then res.locals will have that url as well.
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!(res.locals.currUser && listing.owner._id.equals(res.locals.currUser._id))) {
        req.flash("error", "You do not have permissions to make changes!");
        return res.redirect(`/listing/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of the review!");
        return res.redirect(`/listing/${id}`);
    }
    next();
}