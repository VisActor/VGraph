import { useState } from 'react';
import { RouteObject, RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { LanguageContext, LanguageEnum, getStoredLanguage, storeLanguage } from './i18n';
import menu from '../menu.json';
import { Markdown } from './markdown';

const menuRoutes: RouteObject[] = menu.map(menuItem => {
  return {
    path: `/vgraph/${menuItem.menu}`,
    element: <Markdown />,
    children: [
      {
        path: '*',
        element: <Markdown />
      }
    ]
  };
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to="/vgraph/demo" />
  },
  ...menuRoutes
]);

export function App() {
  const [language, setLanguage] = useState<LanguageEnum>(getStoredLanguage());
  const languageValue = {
    language,
    setLanguage: (lang: LanguageEnum) => {
      setLanguage(lang);
      storeLanguage(lang);
    }
  };
  return (
    <LanguageContext.Provider value={languageValue}>
      <RouterProvider router={router} />
    </LanguageContext.Provider>
  );
}
