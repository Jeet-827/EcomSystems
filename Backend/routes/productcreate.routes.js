import express from "express";
import upload from "../middleware/multer.middleware.js";
import { CreateProduct } from "../controller/product.controller.js";
const productcreate = express.Router();

productcreate.post("/createproduct", upload.any(), CreateProduct);

export default productcreate;