import { onRequest as __api_oss_js_onRequest } from "/home/param/yunhi/functions/api/oss.js"

export const routes = [
    {
      routePath: "/api/oss",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_oss_js_onRequest],
    },
  ]