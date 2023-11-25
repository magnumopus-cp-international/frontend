import { useEffect, useState } from 'react';

export const useDuration = (file: File) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = function () {
      window.URL.revokeObjectURL(video.src);
      setDuration(video.duration * 1000);
      video.remove();
    };

    video.src = URL.createObjectURL(file);
  }, [file]);

  return duration;
};
