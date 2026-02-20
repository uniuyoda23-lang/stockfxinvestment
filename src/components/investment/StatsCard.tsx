import type { ComponentType, SVGProps } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
  iconBgColor?: string;
}
export function StatsCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = 'text-emerald-600',
  iconBgColor = 'bg-emerald-100'
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {change &&
        <div
          className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>

            {isPositive ?
          <ArrowUpRight className="h-3 w-3 mr-0.5" /> :

          <ArrowDownRight className="h-3 w-3 mr-0.5" />
          }
            {change}
          </div>
        }
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>);

}