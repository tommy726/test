import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/custom",
    name: "custom",
    component: () => import("../views/CustomView.vue"),
  },
  {
    path: "/lightbox",
    name: "lightbox",
    component: () => import("../views/LightboxView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
