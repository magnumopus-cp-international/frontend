import { Fragment } from 'react';
import Typist, { TypistProps } from 'react-typist';
import clsx from 'clsx';
import { ReactFCC } from '../../../utils/ReactFCC';
import { Text } from '../../../components/Text';
import { UseLiveTextReturnType } from './useLiveText';
import s from './LiveText.module.scss';

export interface LiveTextProps
  extends Pick<
    UseLiveTextReturnType,
    'text' | 'currentChunk' | 'uniqueKey' | 'isOvertaking' | 'onCharacterTyped' | 'onTypingDone'
  > {
  /**
   * Дополнительный css-класс
   */
  className?: string;
  startDelay?: TypistProps['startDelay'];
  avgTypingDelay?: TypistProps['avgTypingDelay'];
  useHtml?: boolean;
}

export const LiveText: ReactFCC<LiveTextProps> = (props) => {
  const {
    className,
    startDelay,
    avgTypingDelay = 100,
    useHtml,
    text,
    currentChunk,
    isOvertaking,
    uniqueKey,
    onCharacterTyped,
    onTypingDone
  } = props;

  return (
    <Text component={'div'} className={clsx(s.LiveText, className)}>
      {useHtml ? <span dangerouslySetInnerHTML={{ __html: text }} /> : text}
      {currentChunk && (
        <Typist
          startDelay={startDelay}
          avgTypingDelay={isOvertaking ? 10 : 100}
          className={s.LiveText__typist}
          cursor={{ blink: true }}
          key={uniqueKey}
          onCharacterTyped={onCharacterTyped}
          onTypingDone={onTypingDone}>
          {currentChunk}
        </Typist>
      )}
    </Text>
  );
};
