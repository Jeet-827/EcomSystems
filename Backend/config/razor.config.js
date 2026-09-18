import razor from "razorpay";

const rzp = new razor({
  key_id: process.env.RAZOR_1 || "rzp_test_placeholder_key",
  key_secret: process.env.RAZOR_2 || "rzp_test_placeholder_secret",
});

export default rzp;
 