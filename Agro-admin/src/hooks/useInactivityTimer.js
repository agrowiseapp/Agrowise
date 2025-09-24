import { useState, useEffect, useCallback } from 'react';

const useInactivityTimer = (timeout = 600000, onTimeout) => { // 10 minutes default
  const [remainingTime, setRemainingTime] = useState(timeout);
  const [isActive, setIsActive] = useState(true);

  const resetTimer = useCallback(() => {
    setRemainingTime(timeout);
    setIsActive(true);
  }, [timeout]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity]);

  useEffect(() => {
    if (!isActive || remainingTime <= 0) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1000;
        
        if (newTime <= 0) {
          setIsActive(false);
          if (onTimeout) {
            onTimeout();
          }
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, remainingTime, onTimeout]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    remainingTime,
    formattedTime: formatTime(remainingTime),
    isActive,
    resetTimer
  };
};

export default useInactivityTimer;