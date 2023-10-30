const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware.js");
const ListingController = require("../controller/reviews.js");


// Reviews Route 
// Create 
router.post("/", isLoggedIn, validateReview, wrapAsync(ListingController.createReview));

// Delete review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(ListingController.deleteReview));

module.exports = router;