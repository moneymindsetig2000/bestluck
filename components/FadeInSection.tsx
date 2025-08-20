
import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
}

const FadeInSection: React.FC<FadeInSectionProps> = ({ children, className, direction = 'up' }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    const { current } = domRef;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if(current) {
        observer.unobserve(current);
      }
    };
  }, []);

  const getInitialClasses = () => {
    switch (direction) {
      case 'left':
        return 'opacity-0 -translate-x-10';
      case 'right':
        return 'opacity-0 translate-x-10';
      case 'up':
      default:
        return 'opacity-0 translate-y-10';
    }
  };

  return (
    <div
      ref={domRef}
      className={`${className || ''} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : getInitialClasses()}`}
    >
      {children}
    </div>
  );
};

export default FadeInSection;