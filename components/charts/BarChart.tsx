'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: DataPoint[];
  dataKey: string;
  name: string;
  color?: string;
}

export default function BarChart({ data, dataKey, name, color = '#3b82f6' }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#6b7280' }}
          angle={-45}
          textAnchor="end"
          height={100}
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
        <Bar dataKey={dataKey} name={name} fill={color} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
