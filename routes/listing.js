const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controller/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
// const upload = multer({ dest: 'uploads/' });  //here we were storing our files earlier in uploads folder
// but now we want to store the file in cloudinary storage
const upload = multer({ storage });

// Implementing router.route
router.route("/")
    .get(wrapAsync(ListingController.index))       //index route
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(ListingController.createListing));  //Create route
// .post(upload.single('listing[image]'), (req, res) => {
//     res.send(req.file);
// });   //this way the image chosen by us will be stored to the uploads folder and req.file object will be send as response.

// New route
router.get("/new", isLoggedIn, ListingController.renderNewForm);

// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

router.route("/:id")
    .get(wrapAsync(ListingController.showListing))    //Show route
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(ListingController.updateListing))  //Update route
    .delete(isLoggedIn, isOwner, wrapAsync(ListingController.deleteListing));   //Delete route


module.exports = router;