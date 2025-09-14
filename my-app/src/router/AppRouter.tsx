import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../Layout';
import ActivateAccount from '../assets/pages/ActivateAccount';
import ForgotPassword from '../assets/pages/ForgotPassword';
import Home from '../assets/pages/Home';
import Login from '../assets/pages/Login';
import LogoutAll from '../assets/pages/LogoutAll';
import Register from '../assets/pages/Register';
import UserCenter from '../assets/pages/UserCenter';
import UserInfo from '../assets/pages/UserInfo';
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
      {
        path: ROUTES.USER_INFO.replace(/^\//, ""),
        element: <UserInfo />,
      },
      {
        path: "activate",
        element: <ActivateAccount />,
      },
      {
        path: "logout-all",
        element: <LogoutAll />,
      },
      {
        path: "user-center",
        element: <UserCenter />,
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


const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
