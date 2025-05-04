import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 4,
    title: "Gallery",
    path: "/gallery",
    newTab: false,
  },
  {
    id: 33,
    title: "Blog",
    path: "/blog",
    newTab: false,
  },
  {
    id: 5,
    title: "Shop",
    path: "/shop",
    newTab: false,
  },
  {
    id: 4,
    title: "Explore FameuxArte",
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "About Us",
        path: "/about",
        newTab: false,
        
      },
      {
        id: 42,
        title: "Contact Page",
        path: "/contact",
        newTab: false,
      },
      {
        id: 43,
        title: "Our Articles",
        path: "/blog",
        newTab: false,
      },
      {
        id: 44,
        title: "Recent Blogs",
        path: "/blog-sidebar",
        newTab: false,
      },
      {
        id: 45,
        title: "Pintrest pins",
        path: "/blog-details",
        newTab: false,
      },
      {
        id: 45,
        title: "B2B",
        path: "/b2b",
        newTab: false,
      },
      {
        id: 86,
        title: "Join as an Artist",
        path: "/signup",
        newTab: false,
      },
      {
        id: 46,
        title: "Logout",
        path: "/signin",
        newTab: false,
      },,
      
    ],
  },
];
export default menuData;
