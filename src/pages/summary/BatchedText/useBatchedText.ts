import { useCallback, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useSingleTimeout } from '../../../hooks/useSingleTimeout';

export interface UseBatchedTextProps {
  preRenderText?: string;
}

export const useBatchedText = (props: UseBatchedTextProps) => {
  const { preRenderText } = props;

  const [batchedText, setBatchedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const timeout = useSingleTimeout();

  const appendText = useCallback(
    (chunk: string) => {
      setIsTyping(true);
      setBatchedText((text) => text + chunk);

      timeout.set(() => {
        setIsTyping(false);
      }, 1000);
    },
    [timeout]
  );

  const text = preRenderText ? preRenderText + ' ' : '' + batchedText;

  return {
    text,
    isTyping,
    appendText
  };
};
