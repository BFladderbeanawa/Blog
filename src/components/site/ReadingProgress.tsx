'use client';

import { useEffect, useRef } from 'react';

export function ReadingProgress() {
  const railRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const marker = markerRef.current;
    const article = document.querySelector<HTMLElement>('.post-article');
    if (!rail || !marker || !article) return;
    const root = document.documentElement;
    const label = rail.querySelector('[data-progress-label]');
    let frame = 0;
    let previousPercent = -1;
    let drag: { id: number; offset: number } | null = null;

    const update = () => {
      frame = 0;
      const bounds = article.getBoundingClientRect();
      const start = bounds.top + window.scrollY;
      const distance = bounds.height - window.innerHeight;
      const progress =
        distance > 0 ? Math.min(1, Math.max(0, (window.scrollY - start) / distance)) : 1;
      rail.style.setProperty('--reading-progress', `${progress * 100}%`);
      const percent = Math.round(progress * 100);
      if (percent !== previousPercent) {
        marker.setAttribute('aria-valuenow', String(percent));
        if (label) label.textContent = `ΔH=${percent}%`;
        previousPercent = percent;
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const seek = (progress: number) => {
      const bounds = article.getBoundingClientRect();
      const distance = Math.max(0, bounds.height - window.innerHeight);
      window.scrollTo({
        top: bounds.top + window.scrollY + distance * Math.min(1, Math.max(0, progress)),
        behavior: 'instant',
      });
      update();
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const bounds = marker.getBoundingClientRect();
      drag = { id: event.pointerId, offset: event.clientY - (bounds.top + bounds.height / 2) };
      marker.setPointerCapture(event.pointerId);
      marker.dataset.dragging = 'true';
      marker.focus({ preventScroll: true });
    };
    const move = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      event.preventDefault();
      const bounds = rail.getBoundingClientRect();
      seek((event.clientY - drag.offset - bounds.top) / bounds.height);
    };
    const stop = () => {
      if (!drag) return;
      const id = drag.id;
      drag = null;
      marker.dataset.dragging = 'false';
      if (marker.hasPointerCapture(id)) marker.releasePointerCapture(id);
    };
    const key = (event: KeyboardEvent) => {
      const progress = Number(marker.getAttribute('aria-valuenow')) / 100;
      let next: number;
      switch (event.key) {
        case 'ArrowDown':
          next = progress + 0.01;
          break;
        case 'ArrowUp':
          next = progress - 0.01;
          break;
        case 'PageDown':
          next = progress + 0.1;
          break;
        case 'PageUp':
          next = progress - 0.1;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      seek(next);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(article);
    update();
    root.classList.add('reading-progress-ready');
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('blur', stop);
    marker.addEventListener('pointerdown', down);
    marker.addEventListener('pointermove', move);
    marker.addEventListener('pointerup', stop);
    marker.addEventListener('pointercancel', stop);
    marker.addEventListener('lostpointercapture', stop);
    marker.addEventListener('keydown', key);
    return () => {
      stop();
      root.classList.remove('reading-progress-ready');
      window.cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('blur', stop);
      marker.removeEventListener('pointerdown', down);
      marker.removeEventListener('pointermove', move);
      marker.removeEventListener('pointerup', stop);
      marker.removeEventListener('pointercancel', stop);
      marker.removeEventListener('lostpointercapture', stop);
      marker.removeEventListener('keydown', key);
    };
  }, []);

  return (
    <div className="reading-progress" ref={railRef}>
      <span
        className="reading-progress-marker"
        ref={markerRef}
        role="slider"
        tabIndex={0}
        aria-label="Article reading progress"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        data-cursor="drag"
      >
        <span className="reading-progress-label" data-progress-label aria-hidden="true">
          ΔH=0%
        </span>
      </span>
    </div>
  );
}
