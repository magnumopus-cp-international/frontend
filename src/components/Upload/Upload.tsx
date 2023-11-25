import { ComponentPropsWithRef, forwardRef, PropsWithRef, Ref, useId } from 'react';
import clsx from 'clsx';
import composeRefs from '@seznam/compose-react-refs';
import { ReactFCC } from '../../utils/ReactFCC';
import { IntrinsicPropsWithoutRef } from '../../utils/types';
import s from './Upload.module.scss';

export interface UploadButtonProps extends IntrinsicPropsWithoutRef<'input'> {
  /**
   * Дополнительный css-класс
   */
  className?: string;
  // onChange?: (e: any) => void;
  // multiple?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

export const Upload = forwardRef(function Upload(props: UploadButtonProps, ref: Ref<HTMLInputElement>) {
  const { children, className, id: idProp, inputRef, ...inputProps } = props;

  const id = useId();

  return (
    <label htmlFor={idProp ?? id} className={clsx(s.Upload, className)}>
      {children}
      <input
        className={s.Upload__input}
        type="file"
        id={idProp ?? id}
        ref={composeRefs(ref, inputRef)}
        {...inputProps}
      />
    </label>
  );
});
