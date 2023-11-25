import { useQuery } from '@tanstack/react-query';
import { axios } from '../../lib/axios';
import { ExtractFnReturnType, QueryConfig } from '../../lib/react-query';
import { LessonDescriptor } from './types';
import { LESSONS_API_URL } from './urlKeys';
import { QUERY_KEY_LESSON } from './queryKeys';

export type GetLessonResponse = LessonDescriptor;

export const getLesson = ({ lessonId }: { lessonId: string }): Promise<GetLessonResponse> => {
  return axios.get(`${LESSONS_API_URL}/${lessonId}/`);
};

type QueryFnType = typeof getLesson;

type UseLessonOptions = {
  lessonId: string;
  config?: QueryConfig<QueryFnType>;
};

export const useLesson = ({ lessonId, config }: UseLessonOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: [QUERY_KEY_LESSON, lessonId],
    queryFn: async () => {
      return await getLesson({ lessonId });
    }
  });
};
