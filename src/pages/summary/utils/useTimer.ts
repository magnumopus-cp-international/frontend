import { useCallback, useEffect, useRef, useState } from 'react';
import { useSingleTimeout } from '../../../hooks/useSingleTimeout';

export const useTimer = (duration: number, enabled = true) => {
  const [time, setTime] = useState<number | null>(duration);
  const timeout = useSingleTimeout();

  const durationRef = useRef(duration);

  const start = useCallback(() => {
    setTime(durationRef.current);

    const processTime = () => {
      setTime((time) => {
        if (time === null) {
          return null;
        }

        if (time === 0) {
          return 0;
        }

        let newTime = time - 1;
        if (newTime < 0) newTime = 0;

        if (newTime > 0) {
          timeout.set(processTime, 1000);
        }

        return newTime;
      });
    };

    timeout.set(processTime, 1000);
  }, [timeout]);

  const stop = useCallback(() => {
    setTime(null);
    timeout.clear();
  }, [timeout]);

  useEffect(() => {
    if (enabled) {
      start();
    }
  }, [enabled, start]);

  return {
    time: enabled ? time : null,
    start,
    stop
  };
};
