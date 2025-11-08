import { useEffect, useRef } from 'react';

const useWebSocket = (url: string, isLoggedIn: boolean) => {
    const wsRef = useRef<WebSocket | null>(null);
    const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const keepAliveInterval = 5 * 60 * 1000; // 5 minutes
    const setupWebSocket = () => {
        if (isLoggedIn && !wsRef.current) {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                keepAliveIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                    }
                }, keepAliveInterval);
            };

            ws.onmessage = () => {
                console.info('Message: Session Started');
                resetInactivityTimer();
            };

            ws.onclose = () => {
                if (keepAliveIntervalRef.current) {
                    clearInterval(keepAliveIntervalRef.current);
                    keepAliveIntervalRef.current = null;
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);

                if (keepAliveIntervalRef.current) {
                    clearInterval(keepAliveIntervalRef.current);
                    keepAliveIntervalRef.current = null;
                }
            };

            wsRef.current = ws;
        }
    };

    const handleUserActivity = () => {
        resetInactivityTimer();
        if (wsRef.current && wsRef.current.readyState === WebSocket.CLOSED) {
            setupWebSocket();
        }
    };

    const resetInactivityTimer = () => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        inactivityTimerRef.current = setTimeout(() => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        }, keepAliveInterval); // Disconnect after 5 minutes of inactivity
    };

    const cleanupWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (keepAliveIntervalRef.current) {
            clearInterval(keepAliveIntervalRef.current);
            keepAliveIntervalRef.current = null;
        }

        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
    };

    useEffect(() => {


        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);

        window.addEventListener('beforeunload', cleanupWebSocket);

        return () => {
            if (isLoggedIn) {
                setupWebSocket();
            } else {
                cleanupWebSocket();
                window.removeEventListener('mousemove', handleUserActivity);
                window.removeEventListener('keydown', handleUserActivity);
            }
        };
    }, [isLoggedIn]);
    return wsRef.current;
};

export default useWebSocket;
