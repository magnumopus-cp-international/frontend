import Typist from 'react-typist';
import clsx from 'clsx';
import { ReactFCC } from '../../../utils/ReactFCC';
import { Text } from '../../../components/Text';
import s from './BatchedText.module.scss';

export interface BatchedTextProps {
  /**
   * Дополнительный css-класс
   */
  className?: string;
  text?: string;
  useHtml?: boolean;
  isTyping?: boolean;
}

export const BatchedText: ReactFCC<BatchedTextProps> = (props) => {
  const { className, text = '', useHtml, isTyping } = props;

  return (
    <Text component={'div'} className={clsx(s.BatchedText, className)}>
      {useHtml ? <span dangerouslySetInnerHTML={{ __html: text }} /> : text}
      {isTyping && <Typist className={s.BatchedText__typist} />}
    </Text>
  );
};
