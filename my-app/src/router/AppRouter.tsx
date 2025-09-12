import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../Layout';
import ForgotPassword from '../assets/pages/ForgotPassword';
import Home from '../assets/pages/Home';
import Login from '../assets/pages/Login';
import Register from '../assets/pages/Register';
import { ROUTES } from '../constants/routes';

// Error boundary component
const ErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-8">Sorry, an unexpected error has occurred.</p>
        <a
          href={ROUTES.HOME}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};


// Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register", 
        element: <Register />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      // Add more routes here as needed
      // {
      //   path: "profile",
      //   element: <Profile />,
      // },
      // {
      //   path: "cart",
      //   element: <Cart />,
      // },
    ],
  },
]);

// Router provider component
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
