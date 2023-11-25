import { useEffect, useState } from 'react';

export const useFileSize = (file: File, si = true, dp = 1) => {
  const [size, setSize] = useState('');

  useEffect(() => {
    let bytes = file.size;
    const thresh = si ? 1000 : 1024;
    let formattedSize = '';

    if (Math.abs(bytes) < thresh) {
      formattedSize = bytes + ' B';
    } else {
      const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
      let u = -1;
      const r = 10 ** dp;

      do {
        bytes /= thresh;
        ++u;
      } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

      formattedSize = bytes.toFixed(dp) + ' ' + units[u];
    }

    setSize(formattedSize);
  }, [dp, file, si]);

  return size;
};
