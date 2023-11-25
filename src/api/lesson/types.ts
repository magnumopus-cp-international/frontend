export type LessonEntry = {
  sentence: string;
  description: string;
  from_seconds?: number; // timestamp
  to_seconds?: number;
  entry_sentence?: string;
};

export type LessonDescriptor = {
  id: string;
  name: string;
  uploaded: string; // ISO Date
  file: string;
  audio_text: string;
  description: string;
  entries: LessonEntry[];
  report: string;
};

export type MessageDescriptor =
  | {
      type: 'trans';
      data: string;
    }
  | {
      type: 'trans_end';
      data: boolean;
    }
  | {
      type: 'terms';
      data: {
        sentence: string;
        definition: string;
      };
    }
  | {
      type: 'summary';
      data: string;
    }
  | {
      type: 'name';
      data: string;
    };
