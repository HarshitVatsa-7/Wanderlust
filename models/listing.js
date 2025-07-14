const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },    
    description: String,
    image: {
        filename: String,
        url: {
          type: String,
          required: false,
          set: (v) =>
            v === ""
              ? "https://images.unsplash.com/photo-1743448748313-80eb7f9eb2b7?q=80&w=1206&auto=format&fit=crop"
              : v,
        },
      },      
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;