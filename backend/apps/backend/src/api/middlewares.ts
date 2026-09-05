import { defineMiddlewares } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/courses/create",
      method: "POST",
      middlewares: [],
    },
    {
      matcher: "/admin/lms-settings",
      middlewares: [],
    },
  ],
});
