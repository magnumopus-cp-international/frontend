import { Route, Routes } from 'react-router-dom';
import { NewPage } from '../../pages/new';
import { DefaultLayout } from '../../pages/_layouts/DefaultLayout';
import { SummaryPage } from '../../pages/summary';
import { SearchPage } from '../../pages/search';
import { HomePage } from '../../pages/home';
import { HOME_PAGE_ROUTE, NEW_PAGE_ROUTE, SEARCH_PAGE_ROUTE, SUMMARY_PAGE_ROUTE } from './routes';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path={HOME_PAGE_ROUTE} element={<HomePage />} />
        <Route path={NEW_PAGE_ROUTE} element={<NewPage />} />
        <Route path={SUMMARY_PAGE_ROUTE} element={<SummaryPage />} />
        <Route path={SEARCH_PAGE_ROUTE} element={<SearchPage />} />
      </Route>
    </Routes>
  );
};
