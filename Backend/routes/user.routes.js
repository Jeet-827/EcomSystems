import { Signup, Signin, getMe, changePassword, editUser, getAllUsers } from "../controller/user.controller.js";
import express from "express";

const router = express.Router();

router.post("/signup", Signup);
router.post("/signin", Signin);
router.get("/me", getMe);
// Password change routes
router.post("/changepassword", changePassword);
router.post("/userdata/changepassword", changePassword);

// Edit profile / user details routes (supports /edituser and /updateprofile)
router.put("/edituser", editUser);
router.post("/edituser", editUser);
router.put("/updateprofile", editUser);
router.post("/updateprofile", editUser);
router.put("/userdata/updateprofile", editUser);
router.post("/userdata/updateprofile", editUser);
router.put("/userdata/edituser", editUser);
router.post("/userdata/edituser", editUser);

router.get("/alluser", getAllUsers);
router.get("/user/alluser", getAllUsers);

export default router;
