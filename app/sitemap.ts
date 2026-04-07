import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://docexpiry.in", lastModified: new Date(), priority: 1 },
  ];
}
