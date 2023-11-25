import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Typist from 'react-typist';
import formatDuration from 'format-duration';
import clsx from 'clsx';
import { useUrlParam } from '../../hooks/useUrlParam';
import { SUMMARY_PAGE_PARAM } from '../../app/routes';
import { LessonEntry, MessageDescriptor, useLesson, useSearchInLesson } from '../../api/lesson';
import { useSocket } from '../../store/socket';
import { WS_URL } from '../../config';
import { ETextVariants, Text } from '../../components/Text';
import { Loader } from '../../components/Loader';
import { Heading, HeadingSize } from '../../components/Heading';
import { Link } from '../../components/Link';
import { SearchInput } from '../_shared/SearchInput';
import { useTimer } from './utils/useTimer';
import { LiveText, useLiveText } from './LiveText';
import { BatchedText, useBatchedText } from './BatchedText';
import { LessonEntry as LessonEntryCmp } from './LessonEntry';
import { isAudioFile } from './utils/file';
import s from './SummaryPage.module.scss';

const QUERY_KEY_SEARCH = 'search';
const POLLING_INTERVAL = 5000;

export const SummaryPage: FC = () => {
  const lessonId = useUrlParam(SUMMARY_PAGE_PARAM);
  const [params, setParams] = useSearchParams();
  const fromSearch = params.get(QUERY_KEY_SEARCH);
  const [activeTerm, setActiveTerm] = useState<string | undefined>('');

  const [redirected] = useState(() => params.get('redirect'));
  const [size] = useState(() => params.get('size') || '');
  useEffect(() => {
    if (redirected) {
      setParams();
    }
  }, [redirected, setParams]);

  const estimatedTime = size ? Math.floor(Math.log((parseFloat(size) / 2 ** 20) * 60) * 10) : getRandomInt(30, 60);

  // ------ Работа с данными ------

  const [name, setName] = useState('');

  // Запрашиваем инфу о лекции при инициализации
  const {
    data: lessonData,
    isFetched,
    refetch
  } = useLesson({
    lessonId: lessonId ?? '',
    config: {
      enabled: !!lessonId,
      refetchInterval: (data) => {
        if (!data) return false;
        return !!data.name && !data.report && POLLING_INTERVAL;
      }
    }
  });

  // Обработка чанковой подгрузки для глоссария

  const initialEntries = useMemo(() => lessonData?.entries || [], [lessonData]);
  const [batchEntries, setBatchEntries] = useState<LessonEntry[]>([]);
  const entries = useMemo(
    () =>
      [...initialEntries, ...batchEntries].filter((entry, index, arr) => {
        return arr.findIndex((i) => i.description === entry.description) === index;
      }),
    [batchEntries, initialEntries]
  );

  // Маппинг терминов и транскрипта

  const audioDataText = useMemo(() => {
    let audioDataText = lessonData?.audio_text || '';

    entries.forEach((entry) => {
      if (entry.entry_sentence) {
        audioDataText = audioDataText.replace(
          entry.entry_sentence,
          `<span data-match-type="entry" data-term="${entry.sentence}" data-active="${
            fromSearch ? entry.description === fromSearch : entry.entry_sentence === activeTerm
          }">${entry.entry_sentence}</span>`
        );
      }
    });

    return audioDataText;
  }, [lessonData?.audio_text, entries, activeTerm, fromSearch]);

  // Обработка лайв-текста для транскрипта

  const {
    text: audioText,
    currentChunk: audioCurrentChunk,
    appendText: appendAudioText,
    stopLiveText: stopAudioLiveText,
    isActive: isAudioTextActive,
    ...audioLiveTextProps
  } = useLiveText({
    preRenderText: audioDataText
  });

  // Обработка чанковой подгрузки для конспекта

  const {
    appendText: appendSummaryText,
    isTyping: isSummaryTyping,
    text: summaryText
  } = useBatchedText({
    preRenderText: lessonData?.description || ''
  });

  // Обработка подгрузки названия темы
  const [animateName, setAnimateName] = useState(false);
  useEffect(() => {
    if (lessonData?.name) setName(lessonData.name);
  }, [lessonData]);

  const { time, stop } = useTimer(estimatedTime, isFetched && !audioText);

  useSocket({
    url: lessonId ? WS_URL + '/lesson/' + lessonId : '',
    enabled: !!lessonId && !!lessonData,
    onMessage: (msg: MessageDescriptor) => {
      if (msg.type === 'trans') {
        if (time) stop();

        let newChunk = msg.data;
        if (/[.?!;]$/.test(audioCurrentChunk.trim())) {
          newChunk = newChunk[0].toUpperCase() + newChunk.slice(1);
        }

        appendAudioText(newChunk);
      } else if (msg.type === 'trans_end') {
        stopAudioLiveText();
      } else if (msg.type === 'terms') {
        setBatchEntries((entries) => [...entries, { sentence: msg.data.sentence, description: msg.data.definition }]);
      } else if (msg.type === 'summary') {
        appendSummaryText(msg.data);
      } else if (msg.type === 'name') {
        setAnimateName(true);
        setName(msg.data);
        refetch();
      }
    }
  });

  // Поиск по глоссарию

  const [searchValue, setSearchValue] = useState('');
  const onSearch = (value: string) => {
    setParams({});
    setSearchValue(value);
  };

  const onResetSearch = () => {
    setSearchValue('');
  };

  const { data: searchData, isFetching: isFetchingSearchInLesson } = useSearchInLesson({
    lessonId: lessonId || '',
    query: searchValue,
    config: {
      enabled: !!lessonId && !!searchValue
    }
  });

  const filteredEntries = isFetchingSearchInLesson
    ? []
    : searchData
      ? entries.filter((i) => searchData.some((j) => j.description === i.description))
      : entries;

  // ------ Обработка UI ------

  const isAudioTextVisible = time === null && audioText;
  const isGlossaryVisible = isAudioTextVisible && !isAudioTextActive;
  const isSummaryVisible = isGlossaryVisible && !isAudioTextActive;

  const isAudio = isAudioFile(lessonData?.file || '');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <div className={s.SummaryPage}>
      {time !== null && (
        <Text component={'div'} variant={ETextVariants.BODY_L_REGULAR} className={s.SummaryPage__estimated}>
          <Loader />
          {redirected ? (
            <span>
              {time === 0 && 'Осталось совсем чуть-чуть...'}
              {time > 0 && `Примерное время ожидания: ${formatDuration(time * 1000)}`}
            </span>
          ) : (
            <span>Обработка файла...</span>
          )}
        </Text>
      )}

      {isAudioTextVisible && lessonData && (
        <div className={clsx(s.SummaryPage__audio, !isAudio && s.SummaryPage__audio_empty)}>
          <Text variant={ETextVariants.BODY_S_REGULAR}>
            {lessonData.file.split('/')?.[lessonData.file.split('/').length - 1]}
          </Text>
          {isAudioFile(lessonData.file) && (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <audio src={lessonData.file} controls ref={audioRef}></audio>
          )}
        </div>
      )}

      <Heading className={s.SummaryPage__title} size={HeadingSize.H2}>
        {name ? (
          <>
            {animateName ? (
              <Typist className={s.SummaryPage__typist} cursor={{ hideWhenDone: true }}>
                {name}
              </Typist>
            ) : (
              name
            )}
          </>
        ) : (
          time === null && <Loader />
        )}
      </Heading>

      {isAudioTextVisible && (
        <div className={s.SummaryPage__block}>
          <LiveText useHtml text={audioText} currentChunk={audioCurrentChunk} {...audioLiveTextProps} />
        </div>
      )}

      {isGlossaryVisible && (
        <div className={s.SummaryPage__block}>
          <Heading className={s.SummaryPage__heading} size={HeadingSize.H3}>
            Список используемых терминов
          </Heading>

          {!!entries.length && name && (
            <SearchInput
              className={s.SummaryPage__search}
              placeholder={'Поиск по терминам'}
              onSearch={onSearch}
              onReset={onResetSearch}
              value={searchValue}
            />
          )}

          <div>
            {!!searchValue && (
              <Link className={s.SummaryPage__resetSearch} onClick={() => onResetSearch()}>
                Сбросить
              </Link>
            )}
            {isFetchingSearchInLesson && <Loader />}
            {filteredEntries.map((entry, index) => (
              <LessonEntryCmp
                name={entry.sentence}
                description={entry.description}
                timeFrom={entry.from_seconds}
                timeTo={entry.to_seconds}
                showTime={isAudio}
                onClickName={() => {
                  const els = document.querySelectorAll(`[data-match-type="entry"][data-term="${entry.sentence}"]`);
                  const el = Array.from(els).find((i) => i.innerHTML === entry.entry_sentence);
                  el?.scrollIntoView({ block: 'center' });
                  setActiveTerm('');
                  setParams({});
                  setTimeout(() => setActiveTerm(entry.entry_sentence), 0);
                }}
                onClickTime={() => {
                  const time = Math.min(entry.from_seconds || Infinity, entry.to_seconds || Infinity);
                  if (audioRef.current) {
                    audioRef.current.currentTime = time;
                    audioRef.current.play();
                  }
                }}
                key={index}
              />
            ))}
          </div>
        </div>
      )}

      {isSummaryVisible && (
        <div className={s.SummaryPage__block}>
          <Heading className={s.SummaryPage__heading} size={HeadingSize.H3}>
            Конспект
          </Heading>

          <BatchedText isTyping={isSummaryTyping} text={summaryText} />
        </div>
      )}

      {isSummaryVisible &&
        (lessonData?.report ? (
          <Link
            component={'a'}
            className={s.SummaryPage__download}
            href={lessonData.report}
            download={lessonData.report.split('/')?.[lessonData.report.split('/').length - 1]}
            target={'_blank'}
            standalone>
            Скачать PDF
          </Link>
        ) : (
          <Text className={s.SummaryPage__downloadPlaceholder} variant={ETextVariants.BODY_S_REGULAR}>
            Ссылка на скачивание появится позже
          </Text>
        ))}
    </div>
  );
};

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
