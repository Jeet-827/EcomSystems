import Imagekit from "imagekit";

const publicKey =
  process.env.publicKey ||
  process.env.IMAGEKIT_PUBLIC_KEY ||
  process.env.PUBLIC_KEY ||
  "your_imagekit_public_key";

const privateKey =
  process.env.privateKey ||
  process.env.IMAGEKIT_PRIVATE_KEY ||
  process.env.PRIVATE_KEY ||
  "your_imagekit_private_key";

const urlEndpoint =
  process.env.urlEndpoint ||
  process.env.IMAGEKIT_URL_ENDPOINT ||
  process.env.URL_ENDPOINT ||
  "https://ik.imagekit.io/your_imagekit_id";

const imagekit = new Imagekit({
  publicKey,
  privateKey,
  urlEndpoint,
});

export default imagekit;

