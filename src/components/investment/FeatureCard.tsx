interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: 'amber' | 'blue' | 'emerald' | 'purple' | 'pink';
}

export function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400/60 hover:from-amber-500/40',
    blue: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 hover:border-blue-400/60 hover:from-blue-500/40',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400/60 hover:from-emerald-500/40',
    purple: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 hover:border-purple-400/60 hover:from-purple-500/40',
    pink: 'from-pink-500/20 to-red-500/10 border-pink-500/30 hover:border-pink-400/60 hover:from-pink-500/40'
  };

  return (
    <div className={`
      bg-gradient-to-br ${colorClasses[color]}
      rounded-xl p-6 backdrop-blur-sm
      transition-all duration-500 ease-out
      hover:scale-105 hover:shadow-2xl cursor-pointer
      group border
    `}>
      <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-300 group-hover:to-orange-400 group-hover:bg-clip-text transition-all">
        {title}
      </h3>
      <p className="text-slate-300 text-sm group-hover:text-white transition-colors">{description}</p>
      <div className="mt-4 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
    </div>
  );
}
