'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

interface EloHistoryGraphProps {
  eloHistory: any[];
}

export function EloHistoryGraph({ eloHistory }: EloHistoryGraphProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">LP 변화</h3>
      <div className="text-center py-12 text-gray-500">
        준비중입니다
      </div>
    </div>
  );
}
