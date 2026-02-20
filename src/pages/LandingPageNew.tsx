import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, ChevronDown, Mail, X, CheckCircle2, Lock, Star, Shield, Globe, MessageCircle } from 'lucide-react';
import { Logo } from '../components/investment/Logo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { AnimatedButton } from '../components/investment/AnimatedButton';
import { StatCounter } from '../components/investment/StatCounter';
import { FeatureCard } from '../components/investment/FeatureCard';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

type Testimonial = {
  name: string;
  role: string;
  company: string;
  image: string;
  quote: string;
  rating: number;
  country: string;
  flag: string;
};

type TrustIndicator = {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
};

export function LandingPageNew({ onNavigate }: LandingPageProps) {
  const { t } = useTranslation();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  // Background gradients related to investment/finance
  const backgroundGradients = [
    'from-slate-900 via-slate-800 to-slate-900',
    'from-indigo-900 via-purple-900 to-slate-900',
    'from-slate-900 via-blue-900 to-slate-900',
    'from-slate-900 via-green-900 to-slate-900',
    'from-slate-900 via-rose-900 to-slate-900',
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'Amelia Foster',
      role: 'Real Estate Investor',
      company: 'Independent',
      country: 'United States',
      flag: '🇺🇸',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
      quote: 'Invested $15,000 in dividend stocks. Made $2,847 in first year. The research tools helped me pick winners like MSFT and JNJ.',
      rating: 5,
    },
    {
      name: 'Oliver Chen',
      role: 'Software Engineer',
      company: 'Tech Systems',
      country: 'Canada',
      flag: '🇨🇦',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      quote: 'Started with $5,000, now worth $18,340. Reinvesting dividends through the DRIP feature increased returns by 34% annually.',
      rating: 5,
    },
    {
      name: 'Sofia Martinez',
      role: 'Financial Advisor',
      company: 'Wealth Partners',
      country: 'Spain',
      flag: '🇪🇸',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      quote: 'Managed client portfolio of $250,000. Generated $18,500 in annual returns. Platform fees are the lowest I\'ve found.',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'Retired Executive',
      company: 'Independent',
      country: 'United Kingdom',
      flag: '🇬🇧',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
      quote: 'Invested $50,000 in index funds. Earned $7,200 annually in dividends. Stress-free retirement income stream established.',
      rating: 5,
    },
    {
      name: 'Yuki Tanaka',
      role: 'Business Owner',
      company: 'Tokyo Enterprises',
      country: 'Japan',
      flag: '🇯🇵',
      image: '/yuki-tanaka.jpg',
      quote: 'Invested $30,000 across 15 stocks. Portfolio grew to $41,200 in 18 months. Average return of 37% exceeded my expectations.',
      rating: 5,
    },
    {
      name: 'Isabella Rossi',
      role: 'Investment Consultant',
      company: 'European Wealth',
      country: 'Italy',
      flag: '🇮🇹',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      quote: 'Scaled from $8,000 to $24,560 in 2 years. Diversification tools prevented major losses during market dips. Made $4,120 in 2025.',
      rating: 5,
    },
    {
      name: 'James Wellington',
      role: 'Hedge Fund Manager',
      company: 'Capital Partners',
      country: 'Australia',
      flag: '🇦🇺',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
      quote: 'Managing $1.2M across 45 positions. Earned $156,000 in dividends last year. Best execution prices in the industry.',
      rating: 5,
    },
    {
      name: 'Marie Dubois',
      role: 'Teacher & Investor',
      company: 'Independent',
      country: 'France',
      flag: '🇫🇷',
      image: '/marie-dubois.jpg',
      quote: 'Invested $3,500 monthly for 18 months = $63,000 invested. Now worth $71,450. Passive income helps pay mortgage!',
      rating: 5,
    },
  ];

  const trustIndicators: TrustIndicator[] = [
    {
      icon: <Lock className="h-8 w-8 text-amber-400" />,
      title: 'Bank-Level Security',
      description: '256-bit SSL encryption & 2FA protection',
      value: '100%',
    },
    {
      icon: <Shield className="h-8 w-8 text-green-400" />,
      title: 'FDIC Insured',
      description: 'Up to $250k per account covered',
      value: '$250K',
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-400" />,
      title: 'Global Compliance',
      description: 'SEC & FINRA regulated',
      value: '100%',
    },
  ];

  const faqs = [
    {
      question: 'How do I get started with StockFx?',
      answer: 'Simply create a free account, complete verification, and fund your account. Start investing within minutes. We also offer a paper investing account with $100k in virtual funds to practice.',
    },
    {
      question: 'What are the fees?',
      answer: 'Stock and ETF investments are commission-free. Dividend reinvestment available. Options: $0.65 per contract. No account minimums or hidden fees.',
    },
    {
      question: 'Is my money safe?',
      answer: 'Yes. Cash is FDIC insured up to $250k, securities protected by SIPC up to $500k. We use 256-bit encryption, 2FA, and cold storage for 95% of assets.',
    },
    {
      question: 'Can I invest on mobile?',
      answer: 'Absolutely! Our full-featured mobile app gives you complete investing, charting, and portfolio management on iOS and Android.',
    },
    {
      question: 'Is there a minimum deposit?',
      answer: 'No! StockFx has no minimum deposit requirement. You can start with as little as you want.',
    },
    {
      question: 'What can I invest in?',
      answer: 'You can invest in stocks, ETFs, mutual funds, dividend-paying securities, bonds, options, and more - all from one unified platform.',
    },
  ];

  const pricing = [
    {
      name: 'Standard',
      price: '$300 - $5,000',
      description: 'Basic Investment Range',
      duration: '1 Month',
      features: ['Commission-free investments', 'Basic charting tools', 'Mobile app access', '2 watchlists', 'Email support'],
    },
    {
      name: 'Premium',
      price: '$5,000 - $50,000',
      description: 'Growth Investment Range',
      duration: '2-3 Months',
      features: ['Advanced charting & analysis', 'Real-time Level 2 data', 'Unlimited watchlists', 'Priority 24/7 support', 'API access', 'Advanced alerts'],
      popular: true,
    },
    {
      name: 'Gold',
      price: '$50,000+',
      description: 'Premium Investment Range',
      duration: '3-6 Months',
      features: ['Dedicated portfolio manager', 'Custom strategy consulting', 'White-label solutions', 'Advanced integrations', 'VIP support', 'Exclusive research'],
    },
    {
      name: 'Annual Investment',
      price: '$100,000+',
      description: 'Institutional Investment Range',
      duration: '12+ Months',
      features: ['Dedicated investment advisor', 'Full portfolio management', 'Custom hedge strategies', '24/7 concierge support', 'Priority execution', 'Exclusive events & networking'],
    },
  ];

  const howItWorks = [
    {
      number: 1,
      title: 'Sign Up',
      description: 'Create your free account in 2 minutes',
      icon: '📝',
    },
    {
      number: 2,
      title: 'Verify',
      description: 'Complete identity verification securely',
      icon: '✓',
    },
    {
      number: 3,
      title: 'Fund',
      description: 'Add funds via bank transfer or card',
      icon: '💳',
    },
    {
      number: 4,
      title: 'Trade',
      description: 'Start investing in stocks, dividends, and ETFs',
      icon: '📈',
    },
  ];

  const benefits = [
    {
      title: '⚡ Lightning-Fast Execution',
      description: 'Orders execute in milliseconds with our optimized infrastructure',
    },
    {
      title: '📊 Professional Tools',
      description: 'Advanced charting, analysis, and research directly in your account',
    },
    {
      title: '📱 Trade Anywhere',
      description: 'Full-featured mobile app puts everything in your pocket',
    },
    {
      title: '💡 Smart Insights',
      description: 'Real-time market data and actionable investment alerts',
    },
    {
      title: '🔒 Maximum Security',
      description: 'Military-grade encryption and multi-factor authentication',
    },
    {
      title: '👥 Expert Support',
      description: '24/7 customer support from investment professionals',
    },
  ];

  // Show contact modal every 2 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setShowContactModal(true);
    }, 120000);

    return () => clearInterval(timer);
  }, []);

  // Show WhatsApp modal every 1 minute
  useEffect(() => {
    const timer = setInterval(() => {
      setShowWhatsAppModal(true);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Rotate background gradient every 5 seconds
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBackgroundIndex((prev) => (prev + 1) % backgroundGradients.length);
    }, 5000);

    return () => clearInterval(bgTimer);
  }, [backgroundGradients.length]);

  // Scroll animation observer
  useEffect(() => {
    // Lazy load sections as they come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    });

    document.querySelectorAll('[data-observe]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradients[backgroundIndex]} transition-all duration-1000 ease-in-out`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full backdrop-blur-sm bg-black/20 rounded-b-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <Logo size="md" variant="light" showText={true} />
        </div>
        <div className="flex gap-2 sm:gap-3 items-center flex-wrap justify-end">
          <LanguageSwitcher />
          <AnimatedButton onClick={() => onNavigate('admin-login')} variant="ghost" size="sm">Admin</AnimatedButton>
          <AnimatedButton onClick={() => onNavigate('login')} variant="ghost" size="sm">{t('nav.signIn')}</AnimatedButton>
          <AnimatedButton onClick={() => onNavigate('register')} variant="primary" size="sm">{t('nav.getStarted')}</AnimatedButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-32 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm font-medium mb-6 animate-bounce">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 mr-2 animate-pulse" />
          {t('hero.badge')}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
          {t('hero.title1')}
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{t('hero.title2')}</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
          {t('hero.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
          <AnimatedButton onClick={() => onNavigate('register')} variant="primary" size="lg">
            {t('hero.startButton')}
          </AnimatedButton>
          <AnimatedButton onClick={() => onNavigate('login')} variant="outline" size="lg">
            {t('hero.signInButton')}
          </AnimatedButton>
        </div>

        {/* Background Carousel Indicators */}
        <div className="flex gap-2 justify-center flex-wrap">
          {backgroundGradients.map((_, index) => (
            <button
              key={index}
              onClick={() => setBackgroundIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                backgroundIndex === index ? 'w-6 sm:w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Background ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Welcome Video Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="welcome-video">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Welcome to StockFx</h2>
          <p className="text-slate-300 mb-8">Your trusted partner in investment success</p>
          
          {/* Video Placeholder */}
          <div className="relative w-full bg-black/40 rounded-xl overflow-hidden mb-8 aspect-video border border-amber-500/30 flex items-center justify-center group hover:border-amber-400/50 transition">
            <iframe 
              src="/video-player.html" 
              className="w-full h-full border-0"
              title="StockFx Welcome Video"
              allow="fullscreen"
            />
            <div className="absolute top-4 right-4 bg-amber-500/80 text-white px-3 py-1 rounded-full text-xs font-semibold">
              5+ Years of Excellence
            </div>
          </div>

          {/* Company Info */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 hover:bg-white/10 transition">
              <div className="text-3xl font-black text-amber-400 mb-2">5+</div>
              <div className="text-white font-semibold mb-1">Years in Business</div>
              <p className="text-sm text-slate-400">Serving thousands of investors worldwide with trust and transparency</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 hover:bg-white/10 transition">
              <div className="text-3xl font-black text-amber-400 mb-2">100K+</div>
              <div className="text-white font-semibold mb-1">Active Investors</div>
              <p className="text-sm text-slate-400">Growing community of successful investors managing their portfolios</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 hover:bg-white/10 transition">
              <div className="text-3xl font-black text-amber-400 mb-2">$5B+</div>
              <div className="text-white font-semibold mb-1">Assets Managed</div>
              <p className="text-sm text-slate-400">Trusted to manage billions in investments across markets</p>
            </div>
          </div>

          <p className="text-slate-300 mt-12 text-center">
            Watch our welcome video to learn about our journey, mission, and the investment platform designed for your success.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="how-it-works">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {howItWorks.map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition transform hover:scale-105">
                <div className="text-4xl mb-4">{step.icon}</div>
                <p className="text-xl font-bold text-amber-400 mb-2">{step.number}</p>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-300">{step.description}</p>
              </div>
              {i < howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-amber-400 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="benefits">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">Why Investors Love StockFx</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {benefits.map((benefit, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 hover:bg-white/10 transition transform hover:scale-105">
              <h3 className="text-lg font-semibold text-white mb-3">{benefit.title}</h3>
              <p className="text-slate-300 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="features">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">{t('features.title')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <FeatureCard 
            icon="⚡" 
            title={t('features.fast.name')} 
            description={t('features.fast.desc')}
            color="amber" />
          <FeatureCard 
            icon="🔒" 
            title={t('features.security.name')} 
            description={t('features.security.desc')}
            color="blue" />
          <FeatureCard 
            icon="📱" 
            title={t('features.mobile.name')} 
            description={t('features.mobile.desc')}
            color="emerald" />
          <FeatureCard 
            icon="🌍" 
            title={t('features.global.name')} 
            description={t('features.global.desc')}
            color="purple" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="testimonials">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">{t('testimonials.title')}</h2>
        <p className="text-center text-slate-300 mb-12 sm:mb-16">{t('testimonials.subtitle')}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testim, i) => (
            <div key={i} className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/40 rounded-xl p-6 hover:border-amber-400 hover:from-amber-500/30 transition transform hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(testim.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-3xl">{testim.flag}</span>
              </div>
              <Quote className="h-6 w-6 text-amber-500/40 mb-3" />
              <p className="text-sm text-slate-200 mb-5 italic leading-relaxed">"{testim.quote}"</p>
              <div className="bg-white/10 rounded-lg p-3 mb-4 border border-amber-500/30">
                <p className="text-xs text-slate-300 mb-1">📍 {testim.country}</p>
              </div>
              <div className="flex items-center gap-4">
                <img loading="lazy" src={testim.image} alt={testim.name} className="h-14 w-14 rounded-full object-cover border-2 border-amber-400 shadow-lg" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{testim.name}</p>
                  <p className="text-xs text-amber-300 font-semibold">{testim.role}</p>
                  <p className="text-xs text-slate-400">{testim.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="pricing">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Investment Plans</h2>
        <p className="text-center text-slate-300 mb-12 sm:mb-16">{t('pricing.subtitle')}</p>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {pricing.map((plan, i) => (
            <div 
              key={i}
              onClick={() => setExpandedPlan(expandedPlan === i ? null : i)}
              className={`rounded-xl p-6 sm:p-8 border transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                expandedPlan === i 
                  ? 'ring-2 ring-amber-400 scale-105' 
                  : ''
              } ${plan.popular ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500 shadow-xl' : 'bg-white/5 border-white/10'}`}>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {plan.popular && <div className="inline-block px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold mb-4">{t('pricing.pro.popular')}</div>}
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                </div>
                <ChevronDown className={`h-6 w-6 text-amber-400 transition-transform duration-300 flex-shrink-0 ml-2 ${expandedPlan === i ? 'rotate-180' : ''}`} />
              </div>

              <p className="text-3xl font-black text-amber-400 mb-2">{plan.price}</p>
              <p className="text-sm text-amber-300 font-semibold mb-6">{t('pricing.starter.duration')}: {plan.duration}</p>
              
              <ul className={`space-y-3 overflow-hidden transition-all duration-300 ${expandedPlan === i ? 'mb-8 max-h-96 opacity-100' : 'max-h-96 opacity-100'}`}>
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <AnimatedButton 
                onClick={(e) => { 
                  if (e) e.stopPropagation();
                  onNavigate('register');
                }} 
                variant={plan.popular ? "primary" : "outline"}
                size="sm"
                className="w-full">
                {t('pricing.button')}
              </AnimatedButton>
            </div>
          ))}
        </div>
      </section>

      {/* Asset Classes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 my-8" data-observe id="asset-classes">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">Invest All Major Asset Classes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { name: 'Tesla', icon: '🚗', description: 'Invest in Tesla and EV tech stocks', features: ['Zero commission', 'Fractional shares', 'Real-time tracking'] },
            { name: 'ETFs', icon: '🎯', description: 'Access 2000+ ETFs across all sectors', features: ['Instant diversification', 'Lower fees', 'Easy rebalancing'] },
            { name: 'Index Funds', icon: '📊', description: 'Build wealth with passive index investing', features: ['S&P 500', 'NASDAQ-100', 'Total market'] },
            { name: 'Options', icon: '📊', description: 'Advanced options strategies with tools', features: ['All expiration dates', 'Risk analysis', 'Strategy builder'] },
            { name: 'Real Estate', icon: '🏠', description: 'Income-generating real estate investments', features: ['Monthly income', 'Yield tracking', 'REITs available'] },
            { name: 'Bonds', icon: '💳', description: 'Government & corporate bonds', features: ['Fixed income', 'Maturity ladder', 'Yield analysis'] },
            { name: 'Growth Stocks', icon: '⚡', description: 'High-growth stocks like Tesla, NVIDIA', features: ['Tech leaders', 'Growth potential', 'Volatility tools'] },
            { name: 'Mutual Funds', icon: '💼', description: '15,000+ mutual funds available', features: ['Low minimums', 'Professional managed', 'Tax reporting'] },
          ].map((assetClass, i) => (
            <div key={i} className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 hover:border-amber-500 transition transform hover:scale-105">
              <div className="text-4xl mb-3">{assetClass.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{assetClass.name}</h3>
              <p className="text-sm text-slate-300 mb-4">{assetClass.description}</p>
              <div className="space-y-1">
                {assetClass.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Investment Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="investment-tools-section">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Professional Investment Tools</h2>
        <p className="text-center text-slate-300 mb-12 sm:mb-16">Enterprise-grade tools designed for serious investors</p>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { title: 'Advanced Charting', icon: '📊', features: ['40+ technical indicators', 'Real-time data', 'Custom alerts', 'Drawing tools'] },
            { title: 'Market Scanners', icon: '🔍', features: ['Screener filters', 'Momentum analysis', 'Volume spikes', 'Pattern recognition'] },
            { title: 'Portfolio Analytics', icon: '📈', features: ['Risk metrics', 'Performance tracking', 'Tax optimization', 'Rebalancing tools'] },
            { title: 'Research Hub', icon: '🔬', features: ['Expert analysis', 'News surveillance', 'Earnings data', 'Analyst ratings'] },
            { title: 'Order Automation', icon: '⚙️', features: ['Conditional orders', 'Bracket orders', 'One-cancels-other', 'Trailing stops'] },
            { title: 'API & Webhooks', icon: '🔗', features: ['RESTful API', 'WebSocket streams', 'Historical data', 'Portfolio optimization'] },
          ].map((tool, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 hover:bg-white/10 transition">
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h3 className="text-lg font-bold text-white mb-3">{tool.title}</h3>
              <ul className="space-y-2">
                {tool.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-1 w-1 rounded-full bg-emerald-400"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Market Insights & Analysis */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20 my-8" data-observe id="market-insights">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">Real-Time Market Insights</h2>
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">📊</span> Market Data Features
            </h3>
            {[
              'Real-time Level 2 & Level 3 order books',
              'Bid-ask spreads and volume analysis',
              'Market depth visualization',
              'Sector & industry comparisons',
              'Earnings calendar and announcements',
              'Economic indicators integration',
              'Corporate actions tracking',
              'IPO & SPAC alerts',
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-200 text-sm">{feature}</p>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">💡</span> Investment Insights
            </h3>
            {[
              'AI-powered trade recommendations',
              'Sentiment analysis from news',
              'Social media trend tracking',
              'Options flow analysis',
              'Unusual activity alerts',
              'Dividend tracking & tax alerts',
              'Stock split notifications',
              'Insider trading monitoring',
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-200 text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Market Ticker Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12" data-observe id="market-ticker">
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/50 rounded-xl p-6 overflow-hidden">
          <h3 className="text-white font-semibold text-sm mb-4">📊 Live Market Quotes</h3>
          <div className="flex overflow-x-auto gap-4 pb-2 scroll-smooth">
            {[
              { symbol: 'AAPL', price: '$192.45', change: '+2.3%', trend: 'up' },
              { symbol: 'GOOGL', price: '$142.18', change: '+1.8%', trend: 'up' },
              { symbol: 'MSFT', price: '$418.32', change: '+3.1%', trend: 'up' },
              { symbol: 'TSLA', price: '$242.66', change: '-1.2%', trend: 'down' },
              { symbol: 'AMZN', price: '$178.94', change: '+2.5%', trend: 'up' },
              { symbol: 'META', price: '$512.33', change: '+4.2%', trend: 'up' },
              { symbol: 'NVDA', price: '$878.15', change: '+5.1%', trend: 'up' },
            ].map((stock, i) => (
              <div key={i} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-lg p-3 min-w-max hover:bg-white/10 transition">
                <p className="text-amber-400 font-bold text-sm">{stock.symbol}</p>
                <p className="text-white font-semibold text-sm">{stock.price}</p>
                <p className={`text-xs font-semibold ${stock.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>{stock.change}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">Prices updated every 30 seconds • Last updated: just now</p>
        </div>
      </section>

      {/* Risk Management Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="risk-management">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Advanced Risk Management</h2>
        <p className="text-center text-slate-300 mb-12 sm:mb-16">Protect your portfolio with sophisticated risk controls</p>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { 
              title: '🛡️ Position Protection', 
              items: ['Stop-loss orders', 'Trailing stops', 'Bracket orders', 'Profit targets'] 
            },
            { 
              title: '📊 Portfolio Hedging', 
              items: ['Diversified portfolios', 'Long/short strategies', 'Sector balancing', 'Diversification'] 
            },
            { 
              title: '⚠️ Risk Analytics', 
              items: ['Value at Risk (VaR)', 'Greek exposure', 'Correlation analysis', 'Stress testing'] 
            },
            { 
              title: '💰 Margin Management', 
              items: ['Real-time margin watch', 'Liquidation alerts', 'Buying power', 'Risk scoring'] 
            },
            { 
              title: '🔔 Alert System', 
              items: ['Price alerts', 'Technical alerts', 'Volume alerts', 'News alerts'] 
            },
            { 
              title: '📋 Compliance Tools', 
              items: ['Wash sale tracker', 'Tax-loss harvesting', 'Settlement tracking', 'Regulatory'] 
            },
          ].map((section, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <h3 className="text-lg font-bold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Investment Tools & Calculators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10" data-observe id="investment-tools">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">Investment Tools & Calculators</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: '💹', name: 'ROI Calculator', desc: 'Calculate return on investment' },
            { icon: '📉', name: 'Volatility Gauge', desc: 'Measure market volatility' },
            { icon: '🧮', name: 'Compound Calculator', desc: 'See long-term growth potential' },
            { icon: '💰', name: 'Position Sizer', desc: 'Calculate optimal position size' },
            { icon: '📊', name: 'Break-even Finder', desc: 'Find support & resistance levels' },
            { icon: '⏰', name: 'Time Value', desc: 'Options pricing calculator' },
            { icon: '📈', name: 'Growth Projector', desc: 'Project portfolio growth' },
            { icon: '🎯', name: 'Target Analyzer', desc: 'Achieve financial goals' },
          ].map((tool, i) => (
            <div key={i} className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6 text-center hover:border-emerald-500 transition transform hover:scale-105 cursor-pointer">
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
              <p className="text-sm text-slate-300">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning & Education Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="education">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Investment Education & Resources</h2>
        <p className="text-center text-slate-300 mb-12 sm:mb-16">Learn from experts and master your investing skills</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { 
              category: '📚 Beginner Guides', 
              items: ['Getting started', 'Stock basics', 'Mutual Funds 101', 'Dividend investing'] 
            },
            { 
              category: '🚀 Investment Strategies', 
              items: ['Value investing', 'Growth investing', 'Dividend strategies', 'Portfolio building'] 
            },
            { 
              category: '📺 Video Learning', 
              items: ['10-min tutorials', 'Live webinars', 'Expert interviews', 'Market updates'] 
            },
            { 
              category: '🏆 Investment Academy', 
              items: ['Certification courses', 'Stock analysis', 'Risk management', 'Wealth building'] 
            },
          ].map((resource, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 hover:bg-white/10 transition">
              <h3 className="text-lg font-bold text-white mb-4">{resource.category}</h3>
              <ul className="space-y-3">
                {resource.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300 p-2 rounded hover:bg-white/5 cursor-pointer transition">
                    <Star className="h-4 w-4 text-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Performance Metrics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-2xl border border-amber-500/20 my-8" data-observe id="performance">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">Average Investor Performance</h2>
        <div className="grid md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { metric: 'Avg. Annual Return', value: '80%', icon: '📈', change: '+2.3%' },
            { metric: 'Win Rate', value: '90%', icon: '✓', change: '+5.1%' },
            { metric: 'Drawdown Recovery', value: '2.1 days', icon: '⚡', change: 'Faster' },
            { metric: 'Satisfaction Score', value: '4.8/5', icon: '⭐', change: 'Industry High' },
          ].map((perf, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6 text-center hover:bg-white/20 transition">
              <div className="text-3xl mb-2">{perf.icon}</div>
              <p className="text-slate-400 text-sm mb-2">{perf.metric}</p>
              <p className="text-3xl font-black text-amber-400 mb-2">{perf.value}</p>
              <p className="text-xs text-emerald-300 font-semibold">{perf.change}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="stats">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">Platform Statistics</h2>
        <div className="grid md:grid-cols-4 gap-4 sm:gap-8">
          <StatCounter label={t('stats.traders')} value="2M+" icon="👥" trend="up" />
          <StatCounter label={t('stats.assets')} value="$500B+" icon="💰" trend="up" />
          <StatCounter label={t('stats.commission')} value="0%" icon="✨" />
          <StatCounter label={t('stats.uptime')} value="99.9%" icon="⚡" trend="up" />
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="trust">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">{t('trust.title')}</h2>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
          {trustIndicators.map((indicator, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 text-center hover:bg-white/10 transition transform hover:scale-105">
              <div className="flex justify-center mb-4">{indicator.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{indicator.title}</h3>
              <p className="text-slate-300 text-sm mb-3">{indicator.description}</p>
              <p className="text-2xl font-black text-amber-400">{indicator.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="partners">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Trusted by Industry Leaders</h2>
        <p className="text-center text-slate-300 mb-12 sm:mb-16">Powering the world's most innovative investment platforms</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8 items-center justify-center">
          {[
            { name: 'Goldman Sachs', icon: '📊', role: 'Market Data Partner' },
            { name: 'Bloomberg', icon: '📈', role: 'News & Analytics' },
            { name: 'Morgan Stanley', icon: '💼', role: 'Investment Infrastructure' },
            { name: 'Nasdaq', icon: '📉', role: 'Exchange Integration' },
            { name: 'NYSE', icon: '📊', role: 'Stock Exchange' },
            { name: 'Stripe', icon: '💳', role: 'Payment Gateway' },
            { name: 'AWS', icon: '☁️', role: 'Cloud Infrastructure' },
            { name: 'Twilio', icon: '📱', role: 'Communication API' },
          ].map((partner, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition">
              <p className="text-3xl mb-2">{partner.icon}</p>
              <p className="text-white font-semibold text-sm">{partner.name}</p>
              <p className="text-slate-400 text-xs mt-1">{partner.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Broker Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="comparison">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">Why Choose StockFx?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left px-4 py-4 text-white font-bold">Feature</th>
                <th className="text-center px-4 py-4 text-amber-400 font-bold">StockFx ✓</th>
                <th className="text-center px-4 py-4 text-slate-400 font-bold">Competitor A</th>
                <th className="text-center px-4 py-4 text-slate-400 font-bold">Competitor B</th>
                <th className="text-center px-4 py-4 text-slate-400 font-bold">Competitor C</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Commission-Free Investing', stockfx: true, a: true, b: true, c: true },
                { feature: 'Fractional Shares', stockfx: true, a: true, b: false, c: true },
                { feature: 'Dividend Stocks', stockfx: true, a: false, b: true, c: true },
                { feature: 'Stock & ETF Options', stockfx: true, a: true, b: true, c: false },
                { feature: 'Paper Investing/Demo', stockfx: true, a: true, b: false, c: true },
                { feature: 'Advanced Charting', stockfx: true, a: true, b: true, c: true },
                { feature: 'API Access', stockfx: true, a: true, b: false, c: true },
                { feature: '24/7 Live Chat Support', stockfx: true, a: false, b: true, c: false },
                { feature: 'Mobile App (iOS/Android)', stockfx: true, a: true, b: true, c: true },
                { feature: 'Zero Account Minimum', stockfx: true, a: false, b: true, c: false },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/2' : ''}`}>
                  <td className="px-4 py-4 text-white font-medium">{row.feature}</td>
                  <td className="px-4 py-4 text-center">{row.stockfx ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-red-400">✗</span>}</td>
                  <td className="px-4 py-4 text-center text-slate-400">{row.a ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                  <td className="px-4 py-4 text-center text-slate-400">{row.b ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                  <td className="px-4 py-4 text-center text-slate-400">{row.c ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Success Stories - Case Studies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="case-studies">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Success Stories</h2>
        <p className="text-center text-slate-300 mb-12 sm:mb-16">Real traders, real results on StockFx</p>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              name: 'Marcus Chen',
              title: 'Investment Professional & Portfolio Manager',
              image: '/profile-3.jpg',
              story: 'Built diversified portfolio starting with $2,000. Used StockFx analysis tools to research dividend stocks and ETFs. Now manages $5M in client portfolios.',
              metric: '12% average annual returns',
              journey: '5 years'
            },
            {
              name: 'Priya Patel',
              title: 'Physician to Part-time Investor',
              image: '/profile-4.jpg',
              story: 'Invested $50K in diversified portfolio using StockFx tools. Combines medicine career with strategic investing. Passive income covers 30% household expenses.',
              metric: '18% annual returns',
              journey: '3 years'
            },
            {
              name: 'James Rodriguez',
              title: 'Tech Manager to Strategic Investor',
              image: '/profile-5.jpg',
              story: 'Built systematic stock investment strategy using StockFx API. Focuses on dividend stocks and undervalued growth companies. Automated portfolio rebalancing increased efficiency.',
              metric: '$2.5M net worth',
              journey: '4 years'
            },
            {
              name: 'Emma Johnson',
              title: 'Single Mom to Portfolio Manager',
              image: '/profile-7.jpg',
              story: 'Started investing with $500/month from side gigs. StockFx zero minimums and fractional shares made it possible. Now build 6-figure net worth.',
              metric: '$225K portfolio value',
              journey: '4 years'
            },
            {
              name: 'David Kim',
              title: 'Stock Market Competition Winner',
              image: '/profile-6.jpg',
              story: 'Used StockFx paper trading to develop stock analysis skills and won campus investing competition. Attracted attention from investment firms. Now manages growth fund.',
              metric: '$150M AUM',
              journey: '3 years'
            },
            {
              name: 'Lisa Thompson',
              title: 'Corporate Executive to Independent Investor',
              image: '/portrait-chinese-female.jpg',
              story: 'After corporate career, built financial independence through disciplined stock investing. StockFx mobile app enabled research and portfolio management from anywhere.',
              metric: '$1.2M invested',
              journey: '6 years'
            },
          ].map((caseStudy, i) => (
            <div key={i} className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500 transition">
              <div className="flex items-start gap-4 mb-4">
                <img src={caseStudy.image} alt={caseStudy.name} className="h-16 w-16 rounded-full object-cover border-2 border-blue-500" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{caseStudy.name}</h3>
                  <p className="text-sm text-blue-300">{caseStudy.title}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed italic">"{caseStudy.story}"</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3">
                <p className="text-xs text-slate-400 mb-1">Results</p>
                <p className="text-lg font-bold text-blue-400">{caseStudy.metric}</p>
              </div>
              <p className="text-xs text-slate-400">⏱️ Timeline: {caseStudy.journey}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Webinars & Expert Consultation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/20 my-8" data-observe id="webinars">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Expert-Led Webinars & Training</h2>
        <p className="text-center text-slate-300 mb-12 sm:mb-16">Learn from investment professionals and master your wealth-building skills</p>
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">📅</span> Upcoming Webinars
            </h3>
            {[
              { title: 'Dividend Stock Strategy', date: 'Feb 22, 2:00 PM EST', host: 'Mike Sander', level: 'Intermediate', attendees: '2.3K' },
              { title: 'Stock Market Fundamentals', date: 'Feb 24, 5:00 PM EST', host: 'Sarah Liu', level: 'Beginner', attendees: '4.1K' },
              { title: 'Portfolio Risk Management', date: 'Feb 28, 3:00 PM EST', host: 'James Peterson', level: 'Advanced', attendees: '1.8K' },
            ].map((webinar, i) => (
              <div key={i} className="bg-white/5 border border-purple-500/30 rounded-lg p-4 hover:bg-white/10 transition cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm flex-1">{webinar.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    webinar.level === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                    webinar.level === 'Intermediate' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>{webinar.level}</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">🕐 {webinar.date}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <p>👨‍🏫 {webinar.host}</p>
                  <p>👥 {webinar.attendees} registered</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">👥</span> 1-on-1 Consultation
            </h3>
            <div className="bg-white/5 border border-purple-500/30 rounded-lg p-6 space-y-4">
              <p className="text-slate-300 text-sm">Schedule a personalized investment consultation with our expert advisors. Get tailored strategies for your investment goals and risk profile.</p>
              <div className="space-y-3">
                {[
                  { name: 'Strategy Review', desc: 'Analyze and optimize your investment approach', duration: '30 min', price: 'Free' },
                  { name: 'Portfolio Assessment', desc: 'Get personalized investment recommendations', duration: '60 min', price: '$97' },
                  { name: 'VIP Mentorship', desc: 'Monthly 1-on-1 coaching with market experts', duration: 'Monthly', price: '$397/mo' },
                ].map((consultation, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-purple-500 transition">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-white text-sm">{consultation.name}</p>
                      <span className="text-purple-300 font-bold text-sm">{consultation.price}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">{consultation.desc}</p>
                    <p className="text-xs text-slate-500">⏱️ {consultation.duration}</p>
                  </div>
                ))}
              </div>
              <AnimatedButton 
                onClick={() => { }} 
                variant="primary" 
                size="md" 
                className="w-full text-sm">
                📅 Schedule Consultation
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20" data-observe id="faq">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">Frequently Asked Questions</h2>
        <p className="text-center text-slate-300 mb-12 sm:mb-16">Everything you need to know about StockFx</p>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
              <button className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-white/10 transition" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="text-white font-semibold text-left text-sm sm:text-base">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 text-amber-400 transition flex-shrink-0 ml-2 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className="px-4 sm:px-6 pb-4 text-slate-300 border-t border-white/10 text-sm">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center" data-observe id="final-cta">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">{t('cta.title')}</h2>
        <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8">{t('cta.subtitle')}</p>
        <AnimatedButton onClick={() => onNavigate('register')} variant="primary" size="lg">
          {t('cta.button')}
        </AnimatedButton>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 px-4 sm:px-6 mt-12 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 pb-8 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Logo size="md" variant="light" showText={true} />
            </div>
            <p className="text-slate-400 text-sm max-w-xs">The next-generation platform for smart investing. Stocks, ETFs, dividend funds. Professional tools. Zero complexity.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Platform</h4>
              <ul className="space-y-2 text-slate-400 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-amber-400">Features</a></li>
                <li><a href="#pricing" className="hover:text-amber-400">Pricing</a></li>
                <li><a href="#trust" className="hover:text-amber-400">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-slate-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-amber-400">About Us</a></li>
                <li><a href="#" className="hover:text-amber-400">Blog</a></li>
                <li><a href="#" className="hover:text-amber-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-xs sm:text-sm">
                <li><a href="/policies/privacy.html" target="_blank" className="hover:text-amber-400">Privacy</a></li>
                <li><a href="/policies/terms.html" target="_blank" className="hover:text-amber-400">Terms</a></li>
                <li><a href="/policies/disclosures.html" target="_blank" className="hover:text-amber-400">Disclosures</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Follow Us</h4>
              <ul className="space-y-2 text-slate-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-amber-400">Twitter</a></li>
                <li><a href="#" className="hover:text-amber-400">LinkedIn</a></li>
                <li><a href="#" className="hover:text-amber-400">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-xs sm:text-sm">
            <p>&copy; 2026 StockFx Investment Inc. All rights reserved. NMLS #123456</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500 rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-bounce">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-amber-400" />
                <h3 className="text-lg sm:text-xl font-bold text-white">{t('contact.title')}</h3>
              </div>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-slate-300 mb-6 text-sm">{t('contact.message')}</p>
            <div className="space-y-3">
              <AnimatedButton 
                onClick={() => { 
                  setShowContactModal(false); 
                  window.location.href = 'mailto:officialstockfxinvestment@gmail.com'; 
                }} 
                variant="primary" 
                size="md" 
                className="w-full text-sm">
                {t('contact.contact')}
              </AnimatedButton>
              <AnimatedButton 
                onClick={() => setShowContactModal(false)} 
                variant="outline" 
                size="md" 
                className="w-full text-sm">
                {t('contact.later')}
              </AnimatedButton>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-bounce">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Need Help?</h3>
              </div>
              <button onClick={() => setShowWhatsAppModal(false)} className="text-gray-400 hover:text-gray-900">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-700 mb-6 text-sm">Our team is ready to help you with any questions about StockFx. Chat with us on WhatsApp!</p>
            <div className="space-y-3">
              <a
                href="https://wa.me/16462726231"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition w-full text-sm">
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="w-full px-4 py-3 text-gray-700 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition text-sm">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
