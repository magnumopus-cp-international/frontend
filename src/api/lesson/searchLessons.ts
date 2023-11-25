import { useQuery } from '@tanstack/react-query';
import { axios } from '../../lib/axios';
import { ExtractFnReturnType, QueryConfig } from '../../lib/react-query';
import { SEARCH_API_URL } from './urlKeys';
import { QUERY_KEY_SEARCH } from './queryKeys';

export type SearchLessonsResponse = {
  id?: string;
  lesson_id?: string;
  name?: string;
  sentence?: string;
  description?: string;
  uploaded?: string;
  slug?: string;
}[];

export const searchLessons = ({ query }: { query: string }): Promise<SearchLessonsResponse> => {
  return axios.get(`${SEARCH_API_URL}?q=${query}`);
};

type QueryFnType = typeof searchLessons;

type UseSearchLessonsOptions = {
  query: string;
  config?: QueryConfig<QueryFnType>;
};

export const useSearchLessons = ({ query, config }: UseSearchLessonsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: [QUERY_KEY_SEARCH, query],
    queryFn: async () => {
      return await searchLessons({ query });
    }
  });
};
