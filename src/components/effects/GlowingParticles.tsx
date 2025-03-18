"use client";

import { useEffect, useRef } from 'react';
import { useTheme } from '@/app/theme-selector';

export function GlowingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { colorMode, colors } = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full screen
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Mouse position for interactive effect
    let mouseX = 0;
    let mouseY = 0;
    let mouseRadius = 150;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      baseSize: number;
      color: string;
      speed: number;
      velocity: { x: number; y: number };
      opacity: number;
      maxOpacity: number;
      life: number;
      colorIndex: number;
      
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseSize = Math.random() * 3 + 1;
        this.size = this.baseSize;
        
        // Random color from our palette
        const paletteColors = [colors.primary, colors.secondary, colors.accent];
        this.colorIndex = Math.floor(Math.random() * paletteColors.length);
        this.color = paletteColors[this.colorIndex];
        
        this.speed = Math.random() * 0.5 + 0.2;
        this.velocity = {
          x: (Math.random() - 0.5) * this.speed,
          y: (Math.random() - 0.5) * this.speed
        };
        
        this.maxOpacity = Math.random() * 0.5 + 0.2;
        this.opacity = 0;
        this.life = 200 + Math.random() * 200; // Particle lifespan
      }
      
      draw() {
        if (!ctx) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Create radial gradient for glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `${this.color}`);
        gradient.addColorStop(1, `${this.color}00`);
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      update() {
        // Fade in at birth
        if (this.life > 150 && this.opacity < this.maxOpacity) {
          this.opacity += 0.01;
        }
        
        // Fade out at end of life
        if (this.life < 50) {
          this.opacity -= 0.02;
          this.size *= 0.99;
        }
        
        // Mouse interaction - attract particles to mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseRadius) {
          const attractFactor = 0.2; // Strength of attraction
          const angle = Math.atan2(dy, dx);
          
          // Gradually adjust velocity based on mouse position
          this.velocity.x += Math.cos(angle) * attractFactor;
          this.velocity.y += Math.sin(angle) * attractFactor;
          
          // Limit the maximum speed
          const speed = Math.sqrt(
            this.velocity.x * this.velocity.x + 
            this.velocity.y * this.velocity.y
          );
          
          if (speed > 3) {
            this.velocity.x = (this.velocity.x / speed) * 3;
            this.velocity.y = (this.velocity.y / speed) * 3;
          }
          
          // Increase size near mouse
          this.size = this.baseSize * (1 + (mouseRadius - distance) / mouseRadius);
        } else {
          // Return to base size
          this.size = this.baseSize;
          
          // Apply friction to gradually slow down particles
          this.velocity.x *= 0.99;
          this.velocity.y *= 0.99;
        }
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Wrap around edges
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;
        
        this.life -= 1;
        this.draw();
      }
    }
    
    // Array to store particles
    let particles: Particle[] = [];
    
    // Generate new particles occasionally
    const generateParticles = () => {
      // Keep a maximum number of particles based on screen size
      const maxParticles = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 15000));
      
      if (particles.length < maxParticles && Math.random() > 0.92) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        particles.push(new Particle(x, y));
      }
    };
    
    // Get background color from CSS variable
    const getBackgroundColor = () => {
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-background')
        .trim();
      return bgColor || (colorMode === 'dark' ? 'rgba(15, 23, 42, 0.1)' : 'rgba(248, 250, 252, 0.1)');
    };
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Clear canvas with slight trail effect - use theme background color
      const bgColor = getBackgroundColor();
      ctx.fillStyle = bgColor.startsWith('#') 
        ? `${bgColor}1a` // Adding 10% opacity (1a in hex) if it's a hex color
        : colorMode === 'dark' 
          ? 'rgba(15, 23, 42, 0.1)' 
          : 'rgba(248, 250, 252, 0.1)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      // Generate new particles
      generateParticles();
      
      // Update and render particles
      particles.forEach((particle, index) => {
        particle.update();
        
        // Remove dead particles
        if (particle.life <= 0 || particle.opacity <= 0) {
          particles.splice(index, 1);
        }
      });
      
      // Draw connecting lines between nearby particles
      drawConnections();
    };
    
    // Draw connections between particles
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = 0.15 * (1 - distance / 120);
            
            // Use gradient between the two particle colors
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            
            gradient.addColorStop(0, `${particles[i].color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${particles[j].color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Start animation
    animate();
    
    // Initial particles
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      particles.push(new Particle(x, y));
    }
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [colorMode, colors]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0"
    />
  );
} 