'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/app/theme-selector';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
  color: string;
}

export function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { colorMode, colors } = useTheme();
  const particles = useRef<Particle[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const createParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      const size = Math.random() * 3 + 2;
      const life = 0;
      const maxLife = Math.random() * 20 + 20;
      
      const hue = Math.random() * 60 - 30; // Random hue variation
      const baseColor = colorMode === 'dark' ? [100, 150, 255] : [43, 58, 255];
      const r = Math.min(255, Math.max(0, baseColor[0] + hue));
      const g = Math.min(255, Math.max(0, baseColor[1] + hue));
      const b = Math.min(255, Math.max(0, baseColor[2] + hue));
      
      particles.current.push({
        x,
        y,
        size,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        life,
        maxLife,
        color: `rgba(${r}, ${g}, ${b}, ${colorMode === 'dark' ? 0.5 : 0.3})`
      });
    };
    
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create new particles at mouse position
      if (Math.random() < 0.3) {
        createParticle(mousePos.current.x, mousePos.current.y);
      }
      
      // Update and draw particles
      particles.current = particles.current.filter(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life++;
        
        // Fade out based on life
        const opacity = Math.max(0, (1 - particle.life / particle.maxLife) * (colorMode === 'dark' ? 0.5 : 0.3));
        const [r, g, b] = particle.color.match(/\d+/g)!.map(Number);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
        
        return particle.life < particle.maxLife;
      });
      
      animationFrameId.current = requestAnimationFrame(drawParticles);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX,
        y: e.clientY
      };
    };
    
    resizeCanvas();
    drawParticles();
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [colorMode]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
} 