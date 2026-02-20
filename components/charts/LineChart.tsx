'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: DataPoint[];
  dataKey: string;
  name: string;
  color?: string;
}

export default function LineChart({ data, dataKey, name, color = '#3b82f6' }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#6b7280' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis tick={{ fill: '#6b7280' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1f2937', 
            border: '1px solid #374151',
            borderRadius: '8px'
          }}
          labelStyle={{ color: '#f3f4f6' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          name={name}
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
