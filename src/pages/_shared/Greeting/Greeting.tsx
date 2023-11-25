import clsx from 'clsx';
import { ReactFCC } from '../../../utils/ReactFCC';
import { Heading, HeadingSize } from '../../../components/Heading';
import { ETextVariants, Text } from '../../../components/Text';
import s from './Greeting.module.scss';

export interface GreetingProps {
  /**
   * Дополнительный css-класс
   */
  className?: string;
}

export const Greeting: ReactFCC<GreetingProps> = (props) => {
  const { className } = props;

  return (
    <div className={clsx(s.Greeting, className)}>
      <Heading size={HeadingSize.H2} className={s.Greeting__title}>
        Транскрипция аудио <br /> и генерация конспекта
      </Heading>

      <Text className={s.Greeting__text} variant={ETextVariants.BODY_M_REGULAR}>
        Транскрипция и анализ аудиолекций — трудоемкий процесс, который существенно облегчается с применением ИИ. Сервис
        производит транскрибацию ликций, составляет глоссарий и пишет конспект.
      </Text>
    </div>
  );
};
