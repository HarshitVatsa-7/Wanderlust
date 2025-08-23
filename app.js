if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
console.log("SECRET:", process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dburl = process.env.ATLASDB_URL;

// Connect to MongoDB
mongoose.connect(dburl)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("MongoDB connection error:", err));

const isProduction = process.env.NODE_ENV === "production";

// Force HTTPS in production
if (isProduction) {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"] !== "https") {
            return res.redirect("https://" + req.headers.host + req.url);
        }
        next();
    });
}

// **Trust proxy in production (needed for secure cookies behind Render proxy)**
if (isProduction) {
    app.set("trust proxy", 1);
}

// App configuration
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Session store
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
});
store.on("error", (err) => console.log("Mongo Store Error:", err));

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: isProduction,          // Only send cookie over HTTPS
        sameSite: isProduction ? "none" : "lax", // Needed for cross-site in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash & current user middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
app.get("/", (req, res) => res.redirect("/listings"));

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (res.headersSent) return next(err);
    res.status(statusCode).render("error.ejs", { err });
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));


