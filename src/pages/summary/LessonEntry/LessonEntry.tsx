import clsx from 'clsx';
import formatDuration from 'format-duration';
import { ReactFCC } from '../../../utils/ReactFCC';
import { Link } from '../../../components/Link';
import s from './LessonEntry.module.scss';

export interface LessonEntryProps {
  /**
   * Дополнительный css-класс
   */
  className?: string;
  name?: string;
  description?: string;
  timeFrom?: number;
  timeTo?: number;
  onClickName?: () => void;
  onClickTime?: () => void;
  showTime?: boolean;
}

export const LessonEntry: ReactFCC<LessonEntryProps> = (props) => {
  const { className, name, description, timeFrom, timeTo, onClickName, onClickTime, showTime } = props;

  return (
    <div className={clsx(s.LessonEntry, className)}>
      <Link component={'span'} className={s.LessonEntry__name} onClick={() => onClickName?.()}>
        {name}
      </Link>{' '}
      – <span>{description}</span>{' '}
      {showTime && (typeof timeFrom === 'number' || typeof timeTo === 'number') && (
        <Link onClick={() => onClickTime?.()}>
          ({timeFrom && formatDuration(timeFrom * 1000)}
          {typeof timeFrom === 'number' && typeof timeTo === 'number' && ' - '}
          {timeTo && formatDuration(timeTo * 1000)})
        </Link>
      )}
    </div>
  );
};
