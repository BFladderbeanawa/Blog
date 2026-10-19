'use client';

import { useEffect, useRef } from 'react';

const SOURCE = '/la-grande-jatte.webp';
const SAMPLE_WIDTH = 640;
const SAMPLE_HEIGHT = 426;
const RADIUS = 125;

type Dot = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  alpha: number;
  color: string;
};

export function PointillistLandscape() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !scene || !context) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const forced = matchMedia('(forced-colors: active)');
    const image = new window.Image();
    const sample = document.createElement('canvas');
    sample.width = SAMPLE_WIDTH;
    sample.height = SAMPLE_HEIGHT;
    const sampleContext = sample.getContext('2d', { willReadFrequently: true });
    if (!sampleContext) return;
    const still = document.createElement('canvas');
    const stillContext = still.getContext('2d');
    if (!stillContext) return;

    let pixels: Uint8ClampedArray | undefined;
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let scale = 1;
    let frame = 0;
    let previousTime = 0;
    let visible = false;
    let disposed = false;
    let pointerX = -RADIUS;
    let pointerY = -RADIUS;
    let pointerInside = false;
    let bounds = scene.getBoundingClientRect();
    const active = new Set<Dot>();

    const drawDot = (target: CanvasRenderingContext2D, dot: Dot, moving: boolean) => {
      target.globalAlpha = dot.alpha;
      target.fillStyle = dot.color;
      target.beginPath();
      target.arc(
        dot.x + (moving ? dot.dx : 0),
        dot.y + (moving ? dot.dy : 0),
        dot.size,
        0,
        Math.PI * 2,
      );
      target.fill();
    };
    const paint = () => {
      context.clearRect(0, 0, width, height);
      context.globalAlpha = 1;
      context.drawImage(still, 0, 0, width, height);
      if (active.size) {
        let left = width;
        let top = height;
        let right = 0;
        let bottom = 0;
        for (const dot of active) {
          const margin = dot.size + 2;
          left = Math.min(left, dot.x - margin, dot.x + dot.dx - margin);
          top = Math.min(top, dot.y - margin, dot.y + dot.dy - margin);
          right = Math.max(right, dot.x + margin, dot.x + dot.dx + margin);
          bottom = Math.max(bottom, dot.y + margin, dot.y + dot.dy + margin);
        }
        context.save();
        context.beginPath();
        context.rect(left, top, right - left, bottom - top);
        context.clip();
        context.clearRect(left, top, right - left, bottom - top);
        for (const dot of dots) {
          if (
            dot.x + dot.dx + dot.size >= left &&
            dot.x + dot.dx - dot.size <= right &&
            dot.y + dot.dy + dot.size >= top &&
            dot.y + dot.dy - dot.size <= bottom
          ) {
            drawDot(context, dot, true);
          }
        }
        context.restore();
      }
      context.globalAlpha = 1;
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      pointerInside = false;
      for (const dot of active) {
        dot.dx = 0;
        dot.dy = 0;
      }
      active.clear();
      paint();
    };
    const canMove = () =>
      visible && !document.hidden && fine.matches && !reduced.matches && !forced.matches;
    const tick = (time: number) => {
      frame = 0;
      if (!canMove()) {
        reset();
        return;
      }
      const ease = 1 - Math.exp(-Math.min(time - (previousTime || time - 16), 40) / 85);
      previousTime = time;
      let unsettled = false;
      for (const dot of dots) {
        const x = dot.x - pointerX;
        const y = dot.y - pointerY;
        const distanceSquared = x * x + y * y;
        let targetX = 0;
        let targetY = 0;
        if (pointerInside && distanceSquared < RADIUS * RADIUS) {
          const distance = Math.sqrt(distanceSquared);
          const force = (1 - distance / RADIUS) ** 2 * 34;
          // A small tangential component keeps this a brush-like disturbance,
          // not a cursor-sized hole in the painting.
          const divisor = Math.max(distance, 1);
          targetX = ((x - y * 0.35) / divisor) * force;
          targetY = ((y + x * 0.35) / divisor) * force;
        }
        if (Math.abs(targetX - dot.dx) + Math.abs(targetY - dot.dy) > 0.08) unsettled = true;
        dot.dx += (targetX - dot.dx) * ease;
        dot.dy += (targetY - dot.dy) * ease;
        if (Math.abs(dot.dx) + Math.abs(dot.dy) > 0.08) active.add(dot);
        else {
          dot.dx = 0;
          dot.dy = 0;
          active.delete(dot);
        }
      }
      paint();
      if (unsettled) frame = requestAnimationFrame(tick);
      else previousTime = 0;
    };
    const start = () => {
      if (!frame && canMove()) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      if (!pixels || disposed) return;
      reset();
      bounds = scene.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = still.width = Math.round(width * scale);
      canvas.height = still.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      stillContext.setTransform(scale, 0, 0, scale, 0, 0);
      dots = [];
      // Cover the scene without stretching Seurat's figures. Sample inside the
      // painted border; a seeded jitter breaks the sampling lattice on resize.
      const cover = Math.max(width / SAMPLE_WIDTH, height / SAMPLE_HEIGHT);
      const offsetX = (width - SAMPLE_WIDTH * cover) / 2;
      const offsetY = (height - SAMPLE_HEIGHT * cover) / 2;
      const spacing = Math.max(4.6, Math.sqrt((width * height) / 43000));
      let seed = 27992;
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          const px = x + (random() - 0.5) * spacing * 0.8;
          const py = y + (random() - 0.5) * spacing * 0.8;
          const sx = Math.max(0, Math.min(SAMPLE_WIDTH - 1, Math.floor((px - offsetX) / cover)));
          const sy = Math.max(0, Math.min(SAMPLE_HEIGHT - 1, Math.floor((py - offsetY) / cover)));
          const index = (sy * SAMPLE_WIDTH + sx) * 4;
          const fade = Math.max(0, Math.min(1, (px / width - 0.12) / 0.46));
          const alpha = 0.09 + fade * fade * (3 - 2 * fade) * 0.91;
          const dot: Dot = {
            x: px,
            y: py,
            dx: 0,
            dy: 0,
            size: spacing * (0.28 + random() * 0.22),
            alpha,
            color: `rgb(${pixels[index]} ${pixels[index + 1]} ${pixels[index + 2]})`,
          };
          dots.push(dot);
          drawDot(stillContext, dot, false);
        }
      }
      paint();
      canvas.dataset.ready = '';
    };
    const reposition = () => {
      bounds = scene.getBoundingClientRect();
      reset();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !canMove()) return;
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      pointerInside = true;
      start();
    };
    const leave = () => {
      pointerInside = false;
      start();
    };
    const modeChange = () => {
      if (!canMove()) reset();
    };
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        bounds = scene.getBoundingClientRect();
        if (!visible) reset();
      },
      { threshold: 0.05 },
    );
    const resizeObserver = new ResizeObserver(resize);
    image.onload = () => {
      if (disposed) return;
      sampleContext.drawImage(image, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
      pixels = sampleContext.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT).data;
      resize();
    };
    image.src = SOURCE;
    visibility.observe(scene);
    resizeObserver.observe(scene);
    scene.addEventListener('pointermove', move);
    scene.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    // Scene travel changes its viewport position, not its size.
    scene.closest('.home-deck')?.addEventListener('scrollend', reposition);
    document.addEventListener('visibilitychange', modeChange);
    for (const media of [reduced, fine, forced]) media.addEventListener('change', modeChange);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      image.onload = null;
      resizeObserver.disconnect();
      visibility.disconnect();
      scene.removeEventListener('pointermove', move);
      scene.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      scene.closest('.home-deck')?.removeEventListener('scrollend', reposition);
      document.removeEventListener('visibilitychange', modeChange);
      for (const media of [reduced, fine, forced]) media.removeEventListener('change', modeChange);
    };
  }, []);

  return <canvas className="closing-landscape" ref={canvasRef} aria-hidden="true" />;
}
