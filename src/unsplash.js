import { createApi } from "unsplash-js";
import dotenv from "dotenv";

dotenv.config();
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const unsplash = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
});

const searchImages = async (query) => {
  const result = await unsplash.search.getPhotos({
    query,
    page: 1,
    perPage: 20,
  });
  return result.response.results;
};

const constructImageUrl = (result) => {
  return result.urls.regular;
};

const getImageFromUnsplash = async (query) => {
  try {
    const images = await searchImages(query);
    if (images.length === 0) {
      console.log("running backup image search for ", query, "...");
      const backUpImages = await searchImages(type);
      if (backUpImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * backUpImages.length);
        const randomImage = backUpImages[randomIndex];
        console.log("random image from backup", randomImage);
        return constructImageUrl(randomImage);
      }

      console.error("No images found");
      return null;
    }

    const randomIndex = Math.floor(Math.random() * images.length);
    const randomImage = images[randomIndex];
    console.log("random image", randomImage);
    return constructImageUrl(randomImage);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export { getImageFromUnsplash };
