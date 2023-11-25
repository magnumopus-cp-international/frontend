import { Link as RouterLink, Navigate } from 'react-router-dom';
import clsx from 'clsx';
import { ReactFCC } from '../../utils/ReactFCC';
import { SearchInput } from '../_shared/SearchInput';
import { Heading, HeadingSize } from '../../components/Heading';
import { useLessons } from '../../api/lesson/getLessons';
import { NEW_PAGE_ROUTE } from '../../app/routes';
import { LessonCard } from '../_shared/LessonCard';
import { Button, ButtonSize, ButtonVariant } from '../../components/Button';
import s from './HomePage.module.scss';

export const HomePage: ReactFCC = () => {
  const { data: lessonsData, isFetched } = useLessons({});

  const items = (lessonsData || []).filter((item) => item.has_trans);

  if (isFetched && !lessonsData?.length) {
    return <Navigate to={NEW_PAGE_ROUTE} />;
  }

  return (
    <div className={clsx(s.HomePage)}>
      <div className={s.NewPage__main}>
        <SearchInput />

        {/*<Greeting />*/}

        {!!lessonsData && (
          <div className={s.HomePage__history}>
            <Heading className={s.HomePage__heading} size={HeadingSize.H3}>
              Мои лекции
            </Heading>

            <Button
              component={RouterLink}
              to={NEW_PAGE_ROUTE}
              className={s.NewPage__newButton}
              variant={ButtonVariant.secondary}
              size={ButtonSize.small_x}>
              Добавить
            </Button>

            {items.map((item, index) => (
              <LessonCard lessonId={item.id} name={item.name} date={item.uploaded} key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
