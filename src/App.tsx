import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { CartDetail } from './pages/carDetail';
import { Register } from './pages/register';
import { Dashboard } from './pages/dashboard';
import { New } from './pages/dashboard/new';
import { Private } from './routes/private';
import { EditCar } from './pages/editCar';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/detail/:id',
        element: <CartDetail />
      },
      {
        path: '/dashboard',
        element: <Private><Dashboard /></Private>
      },
      {
        path: '/dashboard/new',
        element: <Private><New /></Private>
      },
      {
        path: '/dashboard/edit/:id',
        element: <Private><EditCar /></Private>
      }
    ]
  },

  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },

])


export { router }