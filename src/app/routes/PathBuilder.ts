import { SUMMARY_PAGE_PARAM, SUMMARY_PAGE_ROUTE } from './routes';

export class PathBuilder {
  static getSummaryPath = (id: string, search?: string) => {
    let url = SUMMARY_PAGE_ROUTE.replace(`:${SUMMARY_PAGE_PARAM}`, String(id));
    if (search) {
      url = url + `?search=${search}`;
    }
    return url;
  };
  static getTextPath = (id: number) => SUMMARY_PAGE_ROUTE.replace(`:${SUMMARY_PAGE_PARAM}`, String(id));
}
