import { useCallback, useEffect, useRef, useState } from 'react';
import { tryParseJson } from '../../utils/tryParseJson';
import { useSetState } from './state';

export interface UseSocketProps {
  url: string;
  onSendMessage?: (payload: any) => void;
  onMessage?: (data: any) => void;
  enabled?: boolean;
}

export interface UseSocketState {
  readyState: typeof WebSocket.CONNECTING | typeof WebSocket.OPEN | typeof WebSocket.CLOSING | typeof WebSocket.CLOSED;
  error: Event | null;
  data: string | object | null;
}

export interface UseSocketSendMessageProps {
  payload: any;
}

export const useSocket = (props: UseSocketProps) => {
  const { url, enabled, onSendMessage, onMessage } = props;

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useSetState<UseSocketState>({
    readyState: WebSocket.CONNECTING,
    error: null,
    data: null
  });

  const ws = useRef<WebSocket | null>(null);
  const client = ws.current;

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const data = tryParseJson(event.data) ?? '';
      setMessage(event.data);
      onMessage?.(data);
      setIsLoading(false);
    },
    [onMessage]
  );
  const handleMessageRef = useRef(handleMessage);

  useEffect(() => {
    if (enabled) {
      ws.current = new WebSocket(url);
      ws.current!.onopen = () => {
        setState({ readyState: WebSocket.OPEN });
        console.log('Socket connection has been opened');
      };
      ws.current!.onclose = async () => {
        setState({ readyState: WebSocket.CLOSED });
        console.log('Socket connection has been closed, reconnecting...');
        // ws.current = new WebSocket(url);
        let socketClosed = true;
        await sleep(5000);
        while (socketClosed) {
          try {
            const op = ws.current!.onopen;
            const cl = ws.current!.onclose;
            ws.current = new WebSocket(url);
            ws.current.onmessage = handleMessageRef.current;
            ws.current.onopen = op;
            ws.current.onclose = cl;
            socketClosed = false;
          } catch (e) {
            console.log("Can't connect to socket, reconnecting...");
            await sleep(1000);
          }
        }
      };
      ws.current!.onerror = (event) => {
        setState({ error: event });
        setIsLoading(false);
        console.error('Socket error:', event);
      };
      ws.current!.onmessage = handleMessageRef.current;
    }

    const currentWs = ws.current;

    return () => {
      currentWs?.close();
    };
  }, [enabled, setState, url]);

  useEffect(() => {
    if (ws.current) {
      ws.current!.onmessage = handleMessage;
    }
  }, [handleMessage]);

  useEffect(() => {
    const data = tryParseJson(message) ?? '';

    setState({
      data
    });
  }, [message]);

  const sendMessage = useCallback(
    ({ payload }: UseSocketSendMessageProps) => {
      const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
      client?.send(data);
      onSendMessage?.(payload);
      setIsLoading(true);
    },
    [client]
  );

  return {
    ...state,
    isLoading,
    sendMessage
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
