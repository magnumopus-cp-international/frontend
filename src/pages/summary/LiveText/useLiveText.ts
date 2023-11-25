import { useCallback, useId, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useSingleTimeout } from '../../../hooks/useSingleTimeout';

export interface UseLiveTextProps {
  preRenderText?: string;
  /**
   * Длительность ускоренного набора текста, чтобы догнать новый чанк
   * По умолчанию 2000 мс
   */
  overtakeTime?: number;
  useOvertaking?: boolean;
}

export type UseLiveTextReturnType = ReturnType<typeof useLiveText>;

export const useLiveText = (props: UseLiveTextProps) => {
  const { preRenderText, useOvertaking = true, overtakeTime = 2000 } = props;

  const [batchedText, setBatchedText] = useState<string>('');
  const [currentChunk, setCurrentChunk] = useState('');
  const [uniqueIndex, setUniqueIndex] = useState(0);
  const [isOvertaking, setIsOvertaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const uniqueKeyPrefix = useId();

  const timeout = useSingleTimeout();
  const timeout2 = useSingleTimeout();

  const batchedTextRef = useRef(batchedText);
  const currentChunkRef = useRef(currentChunk);

  const appendText = useCallback(
    (text: string) => {
      if (isTyping) {
        if (useOvertaking) {
          setIsOvertaking(true);
        }
      } else {
        setIsTyping(true);
      }

      if (!isActive) {
        setIsActive(true);
      }

      const handleAppend = () => {
        unstable_batchedUpdates(() => {
          setBatchedText((text) => {
            const newText = text + currentChunk + ' ';
            batchedTextRef.current = newText;
            return newText;
          });
          setCurrentChunk(text);
          currentChunkRef.current = text;
          setUniqueIndex((counter) => counter + 1);
          setIsOvertaking(false);
        });
      };

      if (useOvertaking) {
        timeout.set(() => handleAppend(), isTyping ? overtakeTime : 0);
      } else {
        handleAppend();
      }
    },
    [isTyping, isActive, useOvertaking, currentChunk, timeout, overtakeTime]
  );

  const stopLiveText = useCallback(() => {
    if (isTyping) {
      setIsOvertaking(true);
    }

    timeout2.set(
      () => {
        const newBatchedText = batchedText + currentChunkRef.current + ' ';
        unstable_batchedUpdates(() => {
          setBatchedText(newBatchedText);
          setCurrentChunk('');
          setIsOvertaking(false);
          setIsTyping(false);
          setIsActive(false);
        });
      },
      isTyping ? overtakeTime + 50 : 0
    );
  }, [batchedText, isTyping, overtakeTime, timeout2]);

  const onCharacterTyped = useCallback(() => {
    setIsTyping(true);
  }, []);

  const onTypingDone = useCallback(() => {
    setIsTyping(false);
  }, []);

  const text = preRenderText ? preRenderText + ' ' : '' + batchedText;
  const uniqueKey = uniqueKeyPrefix + uniqueIndex;

  return {
    text,
    currentChunk,
    uniqueKey,
    isOvertaking,
    isActive,
    appendText,
    stopLiveText,
    onCharacterTyped,
    onTypingDone
  };
};
