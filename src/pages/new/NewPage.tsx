import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ReactFCC } from '../../utils/ReactFCC';
import { ETextVariants, Text } from '../../components/Text';
import { Button, ButtonSize, ButtonVariant } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { Upload } from '../../components/Upload';
import { Attachment } from '../../components/Attachment';
import { PathBuilder } from '../../app/routes';
import { SearchInput } from '../_shared/SearchInput';
import { Greeting } from '../_shared/Greeting';
import { ReactComponent as PlusIcon } from './assets/plus.svg';
import { useChunkUpload } from './useChunkUpload';
import s from './NewPage.module.scss';

export const NewPage: ReactFCC = () => {
  const { data, pending, progress, finished, isLoading, completeUpload, inputId, cancelButtonId, dropZoneId } =
    useChunkUpload({
      onSuccess: () => {},
      onCancel: () => {
        setFile(null);
      }
    });

  // ------ Обработка DnD ------

  const [file, setFile] = useState<File | null>(null);
  const canUpload = !pending && !data && !file;

  const onDrop = useCallback(
    (acceptedFiles: File[], _: any, e: any) => {
      if (canUpload) {
        if (acceptedFiles.length) {
          setFile(acceptedFiles[0] as File);
        }
      }

      if (e.target) {
        e.target.value = '';
      }
    },
    [canUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noDrag: !canUpload,
    multiple: false,
    disabled: !canUpload
    // accept: {
    //   'audio/*': ['.mp3'],
    //   'video/*': ['.mp4', '.mov', '.mkv', '.avi']
    // }
  });

  const navigate = useNavigate();
  useEffect(() => {
    if (data) {
      navigate(PathBuilder.getSummaryPath(data.file_id) + `?redirect=true&size=${file?.size}`);
    }
  }, [data, file, navigate]);

  // ------ Логика UI ------

  const isDisabled = file === null || !finished;

  return (
    <div className={s.NewPage}>
      <div className={s.NewPage__main}>
        <SearchInput />

        <Greeting />

        <div className={s.NewPage__box}>
          <div
            id={dropZoneId}
            className={clsx(s.NewPage__dropBox, {
              [s.NewPage__dropBox_hidden]: isDragActive
            })}
            {...getRootProps()}>
            {file && <Attachment file={file} progress={progress} cancelButtonId={cancelButtonId} />}

            <div className={clsx(s.NewPage__filesContainer, !canUpload && s.NewPage__filesContainer_hidden)}>
              <div className={s.NewPage__filesContainerPlaceholder}>
                <Upload
                  {...getInputProps()}
                  id={inputId}
                  name={'file'}
                  onClick={(e: any) => {
                    e.target.value = '';
                  }}
                  onChange={(e) => {
                    if (e.target.files) {
                      setFile(e.target.files[0] as File);
                    }
                  }}>
                  <Button
                    component={'div'}
                    className={s.NewPage__uploadButton}
                    variant={ButtonVariant.secondary}
                    size={ButtonSize.small_x}
                    disabled={!canUpload}>
                    Загрузить файл
                  </Button>
                </Upload>
              </div>
            </div>

            {canUpload && (
              <>
                <Text className={s.NewPage__uploadHint} variant={ETextVariants.CAPTION_S_REGULAR}>
                  Загрузите файл, перетащив его мышкой или нажав кнопку <br />
                  Доступны аудио, видео, текстовые файлы и изображения
                </Text>
              </>
            )}

            <div className={s.NewPage__dropBoxPlaceholder}>
              <PlusIcon className={s.NewPage__dropBoxPlaceholderIcon} />
            </div>
          </div>

          <Divider className={s.NewPage__divider} />

          <Button
            className={s.NewPage__submitButton}
            size={ButtonSize.large_x}
            isLoading={isLoading}
            disabled={isDisabled || isLoading}
            onClick={() => completeUpload()}>
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
};
