import { createBrowserRouter, RouterProvider } from 'react-router';
import './App.css';
import Login from './pages/login';
import Layout from './components/Layout';
import Home from './pages/home';
import { ToastContainer } from 'react-toastify';
import Registration from './pages/registration';
import Match from './pages/match';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout><Home /></Layout>
    },
    {
      path: '/login',
      element: <Login/>
    },
    {
      path: '/registration',
      element: <Registration />
    },
    {
      path: '/match',
      element: <Match />
    }
  ])
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        containerId="app-toast"
      />
    </>
  );
}

export default App;
