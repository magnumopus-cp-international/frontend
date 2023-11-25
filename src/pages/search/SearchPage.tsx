import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { Key } from 'ts-key-enum';
import { ReactFCC } from '../../utils/ReactFCC';
import { Input } from '../../components/Input';
import { Heading, HeadingSize } from '../../components/Heading';
import { isKey } from '../../utils/isKey';
import { HOME_PAGE_ROUTE, SEARCH_PAGE_ROUTE } from '../../app/routes';
import { useSearchLessons } from '../../api/lesson';
import { Loader } from '../../components/Loader';
import { LessonCard } from '../_shared/LessonCard';
import { Link } from '../../components/Link';
import s from './SearchPage.module.scss';

export const SearchPage: ReactFCC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get('q');

  const [value, setValue] = useState('');

  const { data, isLoading } = useSearchLessons({
    query: query || '',
    config: {
      enabled: !!query
    }
  });

  const items = (data || []).filter((item) => {
    return (item.lesson_id || item.id) && (item.name || item.sentence);
  });

  if (!query) {
    return <Navigate to={HOME_PAGE_ROUTE} />;
  }

  return (
    <div className={clsx(s.SearchPage)}>
      <Input
        className={s.SearchPage__input}
        placeholder={'Поиск'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (isKey(e.nativeEvent, Key.Enter)) {
            e.preventDefault();
            if (value.trim()) {
              navigate(`${SEARCH_PAGE_ROUTE}/?q=${value.trim()}`);
            }
          }
        }}
      />

      <Heading className={s.SearchPage__heading} size={HeadingSize.H3}>
        Результаты по запросу {`"${query}"`}
      </Heading>

      {isLoading ? (
        <Loader />
      ) : (
        <div className={s.SearchPage__list}>
          {items.map((item, index) => (
            <LessonCard
              lessonId={(item.lesson_id || item.id) as string}
              name={item.name}
              date={item.uploaded}
              sentence={item.sentence}
              description={item.description}
              isTerm={!!item.slug}
              key={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};
