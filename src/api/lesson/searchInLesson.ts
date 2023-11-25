import { useQuery } from '@tanstack/react-query';
import { axios } from '../../lib/axios';
import { ExtractFnReturnType, QueryConfig } from '../../lib/react-query';
import { LESSONS_API_URL, SEARCH_API_URL } from './urlKeys';
import { QUERY_KEY_SEARCH, QUERY_KEY_SEARCH_IN_LESSON } from './queryKeys';

export type SearchInLessonResponse = {
  lesson_id?: string;
  sentence?: string;
  description?: string;
  slug?: string;
}[];

export const searchInLesson = ({
  lessonId,
  query
}: {
  lessonId: string;
  query: string;
}): Promise<SearchInLessonResponse> => {
  return axios.get(`${LESSONS_API_URL}/${lessonId}/search?q=${query}`);
};

type QueryFnType = typeof searchInLesson;

type UseSearchInLessonOptions = {
  lessonId: string;
  query: string;
  config?: QueryConfig<QueryFnType>;
};

export const useSearchInLesson = ({ lessonId, query, config }: UseSearchInLessonOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: [QUERY_KEY_SEARCH_IN_LESSON, lessonId, query],
    queryFn: async () => {
      return await searchInLesson({ lessonId, query });
    }
  });
};
