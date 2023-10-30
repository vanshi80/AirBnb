const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings })
};

module.exports.renderNewForm = (req, res) => {
    // res.send("hi this is new form");
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
    // instead of writing this way we can create a listing object and these values as the keys of the object 
    // let {title,description,image,price,country,location}=req.body;
    // now the listing object is taken from the req body
    // let listing=req.body.listing;
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Bad Request");
    // }
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing added");
    res.redirect("/listing");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        res.redirect("/listing");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        res.redirect("/listing");
    }
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    // now we will check if the req.file is undefined or not so as to check whether the image is being updated or not.
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    // res.redirect("/listing");
    // if we want to redirect to our show route
    req.flash("success", "Listing is successfully updated!");
    res.redirect(`/listing/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let result = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing is deleted successfully!");
    res.redirect("/listing");
};