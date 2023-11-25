import { Ref, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Key } from 'ts-key-enum';
import { isKey } from '../../../utils/isKey';
import { ReactFCC } from '../../../utils/ReactFCC';
import { SEARCH_PAGE_ROUTE } from '../../../app/routes';
import { Input } from '../../../components/Input';
import s from './SearchInput.module.scss';

export interface SearchInputProps {
  /**
   * Дополнительный css-класс
   */
  className?: string;
  onSearch?: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  innerRef?: Ref<HTMLInputElement>;
  value?: string;
}

export const SearchInput: ReactFCC<SearchInputProps> = (props) => {
  const { className, placeholder = 'Поиск', onSearch, onReset, innerRef, value: valueProp } = props;

  const navigate = useNavigate();

  const [value, setValue] = useState('');

  useEffect(() => {
    if (valueProp !== undefined) {
      setValue(valueProp);
    }
  }, [valueProp]);

  return (
    <Input
      className={clsx(s.SearchInput, className)}
      type={'search'}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onReset={() => onReset?.()}
      onKeyDown={(e) => {
        if (isKey(e.nativeEvent, Key.Enter)) {
          e.preventDefault();
          const val = value.trim();
          if (val) {
            if (onSearch) {
              onSearch(val);
            } else {
              navigate(`${SEARCH_PAGE_ROUTE}/?q=${val}`);
            }
          }
        }
      }}
      inputRef={innerRef}
    />
  );
};
