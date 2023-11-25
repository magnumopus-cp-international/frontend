import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { BACKEND_URL } from '../../config';

const CHUNK_SIZE = 1_000_000; // 1 MB
// const CHUNK_SIZE = 10_000_000; // 100 KB

export interface ChunkUploadData {
  file_id: string;
  message: string;
  status: boolean;
}

export interface UseChunkUploadProps {
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  onSettled?: () => void;
}

export const useChunkUpload = (props: UseChunkUploadProps) => {
  const { onSuccess, onCancel, onSettled } = props;

  const [pending, setPending] = useState(false);
  const [data, setData] = useState<null | ChunkUploadData>(null);
  const [progress, setProgress] = useState<null | number>(null);

  const [isLoading, setIsLoading] = useState(false);
  const finished = !pending && progress === 100;

  const md5Ref = useRef('');
  const uploadIdRef = useRef<string | null>(null);
  const canUploadRef = useRef(true);
  const formDataRef = useRef<any[]>([]);

  useEffect(() => {
    canUploadRef.current = !pending && !data;
  });

  const formId = useId();
  const inputId = `chunk-upload-input${formId}`.replaceAll(':', '-');
  const cancelButtonId = `chunk-upload-button${formId}`.replaceAll(':', '-');
  const dropZoneId = `chunk-upload-drop${formId}`.replaceAll(':', '-');

  const settle = useCallback(() => {
    setPending(false);
    formDataRef.current.splice(0, formDataRef.current.length);
    md5Ref.current = '';
    onSettled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    $(`#${inputId}`).fileupload({
      url: `${BACKEND_URL}/files/api/chunked_upload/`,
      dataType: 'json',
      maxChunkSize: CHUNK_SIZE,
      formData: formDataRef.current,
      replaceFileInput: false,
      // Called before starting upload
      add: function (e: any, request: any) {
        if (!canUploadRef.current) {
          return;
        }

        if (e.originalEvent?.delegatedEvent?.type === 'drop') {
          const el = e.originalEvent?.delegatedEvent?.target;
          const parent = document.querySelector(`#${dropZoneId}`);

          if (!parent || !el) {
            return;
          }

          if (parent !== el && !parent.contains(el)) {
            return;
          }
        }

        calculate_md5(request.files[0], CHUNK_SIZE);
        request.submit();
        setPending(true);
        setProgress(0);

        setTimeout(() => {
          const buttonElement = document.querySelector(`#${cancelButtonId}`);
          buttonElement?.addEventListener('click', function handler(e) {
            buttonElement.removeEventListener('click', handler);
            request.abort();
            onCancel?.();
            settle();
            setData(null);
            setProgress(null);
          });
        }, 50);
      },
      chunkdone: function (e: any, data: any) {
        // Called after uploading each chunk
        if (formDataRef.current.length < 2) {
          formDataRef.current.push({ name: 'upload_id', value: data.result.upload_id });
        }
        const progress = parseInt(String((data.loaded / data.total) * 100.0), 10);
        setProgress(progress);
      },
      done: function (e: any, data: any) {
        setProgress(100);
        setPending(false);
        uploadIdRef.current = data.result.upload_id;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculate_md5 = useCallback((file: File, chunk_size: number) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const slice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    const chunks = Math.ceil(file.size / chunk_size);
    let current_chunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    function onload(e: any) {
      spark.append(e.target.result); // append chunk
      current_chunk++;
      if (current_chunk < chunks) {
        read_next_chunk();
      } else {
        md5Ref.current = spark.end();
      }
    }

    function read_next_chunk() {
      const reader = new FileReader();
      reader.onload = onload;
      const start = current_chunk * chunk_size,
        end = Math.min(start + chunk_size, file.size);
      reader.readAsArrayBuffer(slice.call(file, start, end));
    }
    read_next_chunk();
  }, []);

  const completeUpload = useCallback(() => {
    setIsLoading(true);
    // Called when the file has completely uploaded
    $.ajax({
      type: 'POST',
      url: `${BACKEND_URL}/files/api/chunked_upload_complete/`,
      data: {
        upload_id: uploadIdRef.current,
        md5: md5Ref.current
      },
      dataType: 'json',
      success: function (data: ChunkUploadData) {
        setData(data);
        onSuccess?.(data);
        setProgress(100);
        settle();
      },
      complete: () => {
        setIsLoading(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    pending,
    progress,
    finished,
    isLoading,
    completeUpload,
    inputId,
    cancelButtonId,
    dropZoneId
  };
};
