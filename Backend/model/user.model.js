import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
    },

    orderId: [
      {
        type: mongoose.Schema.ObjectId,
      },
    ],
    googleId:String,

    cartitem: [
      {
        itemimage: [
          {
            type: String,
          },
        ],

        productid: {
          type: mongoose.Schema.ObjectId,
          ref: "products",
        },

        producttitle: {
          type: String,
          required: true,
        },

        productprice: {
          type: Number,
          required: true,
        },

        productdescription: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.model("user", UserSchema);

export default User;
