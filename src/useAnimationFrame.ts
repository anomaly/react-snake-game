import { useCallback, useEffect, useRef } from "react";

export type CallbackFn = (deltaTime: number) => void;

const useAnimationFrame = (callback: CallbackFn, use: boolean = true) => {
    const callbackRef = useRef<CallbackFn>();
    const requestRef = useRef<number>();
    const prevTimeRef = useRef<number>();

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const animate = useCallback(
        (time) => {
            if (use) {
                requestRef.current = requestAnimationFrame(animate);
                callbackRef.current &&
                    prevTimeRef.current &&
                    callbackRef.current(time - prevTimeRef.current);
                prevTimeRef.current = time;
            } else {
                requestRef.current && cancelAnimationFrame(requestRef.current);
            }
        },
        [use]
    );

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            requestRef.current && cancelAnimationFrame(requestRef.current);
        };
    }, [animate]);
};

export default useAnimationFrame;
