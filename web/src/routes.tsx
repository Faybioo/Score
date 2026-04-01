import { createBrowserRouter } from 'react-router';
import Homepage from './webpages/homepage';
import Login from './webpages/login';
import Dashboard from './webpages/dashboard';
import Admin from './webpages/admin';
import SearchPage from './webpages/serachpage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Homepage,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
  },
  { 
    path: '/admin', 
    Component: Admin 
  },
  {
    path: '/search',
    Component: SearchPage,
  }
]);