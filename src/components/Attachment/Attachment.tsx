import { ComponentType, ElementType, ReactComponentElement } from 'react';
import clsx from 'clsx';
import formatDuration from 'format-duration';
import { ReactFCC } from '../../utils/ReactFCC';
import { useHover } from '../../hooks/useHover';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ReactComponent as DocIcon } from './assets/doc.svg';
import { ReactComponent as XlsIcon } from './assets/xls.svg';
import { ReactComponent as PdfIcon } from './assets/pdf.svg';
import { ReactComponent as FileIcon } from './assets/file.svg';
import { useDuration } from './useDuration';
import { useFileSize } from './useFileSize';
import s from './Attachment.module.scss';

export interface AttachmentProps {
  /**
   * Дополнительный css-класс
   */
  className?: string;
  /**
   * Объект файла
   */
  file: File;
  progress: number | null;
  cancelButtonId: string;

  onClick?: () => void;
}

const extensionIcon: { [key: string]: ElementType } = {
  doc: DocIcon,
  docx: DocIcon,
  xls: XlsIcon,
  xlsx: XlsIcon,
  pdf: PdfIcon
};

export const Attachment: ReactFCC<AttachmentProps> = (props) => {
  const { className, file, onClick, progress, cancelButtonId } = props;

  const ext = file.name.split('.')[file.name.split('.').length - 1];
  const Component = extensionIcon[ext] || FileIcon;

  const duration = useDuration(file);
  const size = useFileSize(file, false);

  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();

  return (
    <div className={clsx(s.Attachment, className)}>
      <div className={s.Attachment__row}>
        <Component className={s.Attachment__icon} />

        <div className={clsx(s.Attachment__text)}>{file.name}</div>

        {isDesktop && (
          <>
            <div className={clsx(s.Attachment__meta, s.Attachment__meta_first)}>
              {/*{isDesktop && 'Длительность: '}*/}
              Длительность: {formatDuration(duration)}
            </div>

            <div className={clsx(s.Attachment__meta)}>
              {/*{isDesktop && 'Размер: '}*/}
              Размер: {size}
            </div>

            <div className={s.Attachment__progress}>{typeof progress === 'number' ? `${progress}%` : ''}</div>
          </>
        )}

        <div className={clsx(s.Attachment__cross)} id={cancelButtonId} onClick={() => onClick?.()}>
          {'×'}
        </div>
      </div>

      {isMobile && (
        <div className={s.Attachment__row}>
          <div className={clsx(s.Attachment__meta)}>Длительность: {formatDuration(duration)}</div>

          <div className={clsx(s.Attachment__meta)}>Размер: {size}</div>

          <div className={s.Attachment__progress}>{typeof progress === 'number' ? `${progress}%` : ''}</div>
        </div>
      )}
    </div>
  );
};
