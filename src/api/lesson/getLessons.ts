import { useQuery } from '@tanstack/react-query';
import { axios } from '../../lib/axios';
import { ExtractFnReturnType, QueryConfig } from '../../lib/react-query';
import { LessonDescriptor } from './types';
import { LESSONS_API_URL } from './urlKeys';
import { QUERY_KEY_LESSONS } from './queryKeys';

export type GetLessonsResponse = (LessonDescriptor & {
  has_trans?: boolean;
})[];

export const getLessons = (): Promise<GetLessonsResponse> => {
  return axios.get(`${LESSONS_API_URL}/`);
};

type QueryFnType = typeof getLessons;

type UseLessonsOptions = {
  config?: QueryConfig<QueryFnType>;
};

export const useLessons = ({ config }: UseLessonsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: [QUERY_KEY_LESSONS],
    queryFn: async () => {
      return await getLessons();
    }
  });
};
