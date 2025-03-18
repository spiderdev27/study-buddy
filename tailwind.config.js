/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'var(--color-primary, #4F46E5)',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'var(--color-secondary, #9333EA)',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'var(--color-accent, #10B981)',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			success: '#10B981',
  			warning: '#FBBF24',
  			error: '#EF4444',
  			info: '#3B82F6',
  			background: 'var(--color-background, #0F172A)',
  			'bg-primary': 'var(--color-background, #0F172A)',
  			'bg-secondary': 'var(--color-background, #0F172A)',
  			'bg-card': 'var(--color-card-bg, rgba(30, 41, 59, 0.7))',
  			'text-primary': 'var(--color-text-primary, #FFFFFF)',
  			'text-secondary': 'var(--color-text-secondary, #CBD5E1)',
  			foreground: 'var(--color-text-primary, #FFFFFF)',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'SF Pro Display',
  				'system-ui',
  				'sans-serif'
  			],
  			body: [
  				'Inter',
  				'SF Pro Text',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'SF Mono',
  				'monospace'
  			]
  		},
  		boxShadow: {
  			glow: '0 4px 20px rgba(var(--color-primary-rgb, 79, 70, 229), 0.3)',
  			'glow-hover': '0 8px 30px rgba(var(--color-primary-rgb, 79, 70, 229), 0.5)',
  			card: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  			'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  		},
  		backdropFilter: {
  			blur: 'blur(20px)'
  		},
  		animation: {
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			float: 'float 6s ease-in-out infinite',
  			shimmer: 'shimmer 2s linear infinite'
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-1000px 0'
  				},
  				'100%': {
  					backgroundPosition: '1000px 0'
  				}
  			}
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			shimmer: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)'
  		},
  		borderRadius: {
  			xl: '1rem',
  			'2xl': '1.5rem',
  			'3xl': '2rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					color: 'var(--text-primary)',
  					a: {
  						color: 'var(--primary)',
  						'&:hover': {
  							color: 'var(--primary-hover)'
  						}
  					},
  					strong: {
  						color: 'var(--primary)'
  					},
  					h1: {
  						color: 'var(--text-primary)'
  					},
  					h2: {
  						color: 'var(--text-primary)'
  					},
  					h3: {
  						color: 'var(--text-primary)'
  					},
  					h4: {
  						color: 'var(--text-primary)'
  					},
  					code: {
  						color: 'var(--text-primary)'
  					},
  					blockquote: {
  						color: 'var(--text-secondary)',
  						borderLeftColor: 'var(--primary)'
  					}
  				}
  			}
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/typography'),
      require("tailwindcss-animate")
],
  safelist: [
    'from-primary',
    'from-secondary',
    'from-accent',
    'to-primary',
    'to-secondary',
    'to-accent',
    'to-transparent',
    'mode-light',
    'mode-dark',
    'via-primary',
    'via-secondary',
    'via-accent',
    'opacity-30',
    'opacity-10',
    'opacity-50',
    'bg-primary',
    'from-primary/5', 'from-primary/10', 'from-primary/20', 'from-primary/30', 'from-primary/40', 'from-primary/50',
    'from-secondary/5', 'from-secondary/10', 'from-secondary/20', 'from-secondary/30', 'from-secondary/40', 'from-secondary/50',
    'from-accent/5', 'from-accent/10', 'from-accent/20', 'from-accent/30', 'from-accent/40', 'from-accent/50',
    'to-primary/5', 'to-primary/10', 'to-primary/20', 'to-primary/30', 'to-primary/40', 'to-primary/50',
    'to-secondary/5', 'to-secondary/10', 'to-secondary/20', 'to-secondary/30', 'to-secondary/40', 'to-secondary/50',
    'to-accent/5', 'to-accent/10', 'to-accent/20', 'to-accent/30', 'to-accent/40', 'to-accent/50',
    'via-primary/5', 'via-primary/10', 'via-primary/20', 'via-primary/30', 'via-primary/40', 'via-primary/50',
    'via-secondary/5', 'via-secondary/10', 'via-secondary/20', 'via-secondary/30', 'via-secondary/40', 'via-secondary/50',
    'via-accent/5', 'via-accent/10', 'via-accent/20', 'via-accent/30', 'via-accent/40', 'via-accent/50',
  ],
} 