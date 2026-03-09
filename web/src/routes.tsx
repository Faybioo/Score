import { createBrowserRouter } from 'react-router';
import Homepage from './webpages/homepage';
import Login from './webpages/login';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Homepage,
  },
  {
    path: '/login',
    Component: Login,
  },
]);
