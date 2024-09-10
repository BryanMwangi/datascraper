import fs from "fs";
import { getImageFromUnsplash } from "./src/unsplash.js";

const ITEMS_FILE_PATH = "./data/items.json";
const NEW_ITEMS_FILE_PATH = "./data/new_items.json";
const QUERY_FILE_PATH = "./data/queries.json";
const UNSPLASH_IMAGES_FILE_PATH = "./data/unsplash_images.json";

const getUniqueQueries = async () => {
  let items = fs.readFileSync(ITEMS_FILE_PATH);
  items = JSON.parse(items);
  const queries = [];
  for (const item of items) {
    const name = item.name;
    const type = item.type;
    const query = `${name} ${type}`;
    if (!queries.includes(query)) {
      queries.push(query);
    }
  }
  fs.writeFileSync(QUERY_FILE_PATH, JSON.stringify(queries, null, 2));
};

const getImagesFromWeb = async () => {
  try {
    let queries = fs.readFileSync(QUERY_FILE_PATH);
    queries = JSON.parse(queries);
    const images = [];

    for (const query of queries) {
      console.log("running image search for ", query, "...");
      const image = await getImageFromUnsplash(query);
      const data = {
        id: query,
        image: image,
      };
      images.push(data);
      console.log("completed", query);
    }

    fs.writeFileSync(
      UNSPLASH_IMAGES_FILE_PATH,
      JSON.stringify(images, null, 2)
    );
    return images;
  } catch (error) {
    console.error(error);
  }
};

const updatePostsWithImages = async () => {
  let items = fs.readFileSync(ITEMS_FILE_PATH);
  items = JSON.parse(items);
  const images = await getImagesFromWeb();
  const newItems = [];
  for (const item of items) {
    const name = item.name;
    const type = item.type;

    const query = `${name} ${type}`;
    const image = images.find((image) => image.id === query);
    if (image && !item.imageUrl) {
      item.imageUrl = image.image;
      newItems.push(item);
    }
  }
  fs.writeFileSync(NEW_ITEMS_FILE_PATH, JSON.stringify(newItems, null, 2));
};

getUniqueQueries();
updatePostsWithImages();
