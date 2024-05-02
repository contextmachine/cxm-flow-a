import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: "gdmdqw20",
  dataset: "production",
  token:
    "skhNcrCJkyEb2A6IyeytVeOvDdpiC91XYiIvYVHZW8OHHhlFdYYEDgzUfJUs4qnKAMMq5d1YMmyu537VUiSlUkijR9auHqOYbEUla5GYwxWpXpeiFFrY3qyctQy7alnRpVk5RgAHuB59cb7xVH7WNHZAnKwD7DPqEOYFtGZQCQxxI2mD7eyt",
  useCdn: false,
});
