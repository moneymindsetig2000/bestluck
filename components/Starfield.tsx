import React from 'react';

interface StarfieldProps {
  scrollFadeStartRef: React.RefObject<HTMLElement>;
  scrollFadeEndRef: React.RefObject<HTMLElement>;
  hoverReappearRef: React.RefObject<HTMLElement>;
  isHoverReappearActive: boolean;
}

const Starfield: React.FC<StarfieldProps> = ({
  scrollFadeStartRef,
  scrollFadeEndRef,
  hoverReappearRef,
  isHoverReappearActive
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const globalOpacityRef = React.useRef(1);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: any[] = [];
    let animationFrameId: number;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStar = (star: any = {}) => {
      star.x = Math.random() * canvas.width;
      star.y = Math.random() * canvas.height;
      star.radius = Math.random() * 1.2 + 0.5;
      star.maxAlpha = Math.random() * 0.7 + 0.3;
      star.alpha = 0;
      star.life = 0; // 0 to 1 for fade in, 1 to 2 for fade out
      // Increased speed as requested
      star.speed = (Math.random() * 0.04) + 0.01;
      return star;
    }

    const createStars = () => {
      stars = [];
      const starCount = Math.floor((window.innerWidth * window.innerHeight) / 6000);
      for (let i = 0; i < starCount; i++) {
        stars.push(initStar());
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ctaRect = hoverReappearRef.current?.getBoundingClientRect();

      stars.forEach(star => {
        star.life += star.speed;

        if (star.life < 1) { // Fading in
          star.alpha = star.life * star.maxAlpha;
        } else if (star.life < 2) { // Fading out
          star.alpha = star.maxAlpha - ((star.life - 1) * star.maxAlpha);
        } else { // Life cycle over, reset
          initStar(star);
        }

        let finalAlpha = star.alpha;

        const isInsideCta = ctaRect && star.x >= ctaRect.left && star.x <= ctaRect.right && star.y >= ctaRect.top && star.y <= ctaRect.bottom;

        if (isHoverReappearActive && isInsideCta) {
          // Inside CTA and hovered, use full alpha and ignore global opacity
        } else {
          finalAlpha *= globalOpacityRef.current;
        }


        if (finalAlpha > 0.01) { // Threshold to avoid drawing invisible stars
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 225, 255, ${finalAlpha})`;
            ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    
    const handleScroll = () => {
        const faqEl = scrollFadeStartRef.current;
        const ctaEl = scrollFadeEndRef.current;
        if (!faqEl || !ctaEl) {
            globalOpacityRef.current = 1;
            return;
        }

        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        // Start fading when the top of the FAQ section is in the middle of the screen
        const fadeStart = faqEl.offsetTop - vh / 2;
        // End fading when the top of the CTA section is at the top of the screen
        const fadeEnd = ctaEl.offsetTop;

        const fadeRange = fadeEnd - fadeStart;

        if (scrollY < fadeStart) {
            globalOpacityRef.current = 1;
        } else if (scrollY > fadeEnd) {
            globalOpacityRef.current = 0;
        } else {
            const progress = (scrollY - fadeStart) / fadeRange;
            globalOpacityRef.current = 1 - progress;
        }
    };

    const handleResize = () => {
      setCanvasDimensions();
      createStars();
      handleScroll();
    };

    setCanvasDimensions();
    createStars();
    animate();
    handleScroll();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollFadeStartRef, scrollFadeEndRef, hoverReappearRef, isHoverReappearActive]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />;
};

export default Starfield;
