import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook providing smooth auto-scrolling to bottom for chat message list.
 */
export function useAutoScroll<T extends HTMLElement>(dependencies: unknown[] = []) {
  const containerRef = useRef<T | null>(null);
  const isAutoScrollEnabledRef = useRef<boolean>(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Enable auto-scroll if user is within 100px of bottom
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    isAutoScrollEnabledRef.current = distanceFromBottom < 100;
  }, []);

  useEffect(() => {
    if (isAutoScrollEnabledRef.current) {
      scrollToBottom('smooth');
    }
  }, [scrollToBottom, ...dependencies]);

  return {
    containerRef,
    scrollToBottom,
    handleScroll,
  };
}
