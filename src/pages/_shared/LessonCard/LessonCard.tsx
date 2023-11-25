import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ReactFCC } from '../../../utils/ReactFCC';
import { ETextVariants, Text } from '../../../components/Text';
import { Link } from '../../../components/Link';
import { PathBuilder } from '../../../app/routes';
import s from './LessonCard.module.scss';

export interface SearchCardProps {
  /**
   * Дополнительный css-класс
   */
  className?: string;
  date?: string;
  lessonId: string;
  name?: string;
  sentence?: string;
  description?: string;
  isTerm?: boolean;
}

export const LessonCard: ReactFCC<SearchCardProps> = (props) => {
  const { className, lessonId, date, name, sentence, description, isTerm } = props;

  return (
    <Link
      component={RouterLink}
      to={PathBuilder.getSummaryPath(lessonId, isTerm ? description : undefined)}
      className={clsx(s.LessonCard, className)}>
      <div className={s.LessonCard__head}>
        {date && (
          <Text className={s.LessonCard__id} variant={ETextVariants.CAPTION_S_REGULAR}>
            {format(new Date(date), 'dd.MM.yyyy HH:mm')}
          </Text>
        )}

        {!isTerm && !name && <div className={s.LessonCard__badge}>обработка</div>}
      </div>

      <Text
        className={clsx(s.LessonCard__name, !name && s.LessonCard__name_empty)}
        variant={ETextVariants.BODY_L_MEDIUM}>
        {isTerm ? sentence : name || 'Без названия'}
      </Text>

      {!!(sentence || description) && (
        <div>
          {!!sentence && (
            <>
              <span className={s.LessonCard__sentence}>{sentence}</span> –{' '}
            </>
          )}
          {!!description && <span>{description}</span>}
        </div>
      )}
    </Link>
  );
};
