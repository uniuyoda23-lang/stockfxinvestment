import { useState } from 'react';

interface AnimatedButtonProps {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedButton({
  onClick,
  children,
  className = '',
  variant = 'primary',
  size = 'md'
}: AnimatedButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    
    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple absolute rounded-full bg-white/40 pointer-events-none';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.animation = 'ripple-animation 0.6s ease-out';

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // Reset clicked state
    setTimeout(() => setIsClicked(false), 300);

    onClick?.(e);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl hover:shadow-orange-500/50',
    secondary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-blue-500/50',
    outline: 'bg-white/10 border border-slate-400 text-white hover:bg-white/20',
    ghost: 'text-white hover:bg-white/10'
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-lg font-semibold
        transition-all duration-300 ease-out
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isClicked ? 'scale-95 shadow-lg' : 'active:scale-95'}
        ${className}
      `}
    >
      <style>{`
        @keyframes ripple-animation {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
