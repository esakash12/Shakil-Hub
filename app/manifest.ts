import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sakil Hub - Video Editing Academy & Production Studio",
    short_name: "Sakil Hub",
    description:
      "Master modern video editing, color grading, motion design, and cinematography with premium industry masterclasses.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#000000",
    icons: [
      {
        src: "/images/sakil-hub-logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/images/sakil-hub-logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
