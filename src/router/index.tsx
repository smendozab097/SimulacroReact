import { createBrowserRouter } from "react-router";
import Home from "../pages/auth/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CategoriesList from "../pages/CategoriesList";
import CategoryDetail from "../pages/CategoryDetail";
import CreateCategory from "../pages/CreateCategory";
import ProductDetail from "../pages/ProductDetail";
import ProductForm from "../components/ProductForm";
import Products from "../pages/Products";
import FavoritesList from "../pages/FavoritesList";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/ProtectedRoute";

export const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout/>,
    errorElement: <NotFound/>,
    children:[
      {
        index: true,
        element: <Home/>
      },
      {
        path: '/login',
        element: <Login/>,
      },
      {
        path: '/register',
        element: <Register/>,
      },
      // Rutas públicas de categorías
      {
        path: '/categorias',
        element: <CategoriesList />,
      },
      {
        path: '/categorias/:id',
        element: <CategoryDetail />,
      },
      // Rutas públicas de productos
      {
        path: '/productos',
        element: <Products />,
      },
      {
        path: '/productos/:id',
        element: <ProductDetail />,
      },
      // 1. Rutas protegidas para cualquier usuario autenticado (Nivel 1)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/favoritos',
            element: <FavoritesList />,
          },
          {
            path: '/productos/nuevo',
            element: <ProductForm />,
          },
          {
            path: '/productos/editar/:id',
            element: <ProductForm />,
          }
        ]
      },
      // 2. Rutas protegidas exclusivas para rol Admin (Nivel 2)
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          {
            path: '/categorias/nuevo',
            element: <CreateCategory />
          }
        ]
      }
    ]   
  },
  {
    path: '/login',
    element: <Login/>,
  },
]);