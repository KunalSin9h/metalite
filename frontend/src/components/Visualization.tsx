import React from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface VisualizationProps {
    data: any[];
    type: 'bar' | 'line' | 'area';
    xAxisKey: string;
    dataKey: string;
}

export const Visualization: React.FC<VisualizationProps> = ({ data, type, xAxisKey, dataKey }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-[#666666] text-xs">
                No data to visualize
            </div>
        );
    }

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                        <XAxis dataKey={xAxisKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#252526', borderColor: '#333333', color: '#CCCCCC' }}
                            itemStyle={{ color: '#CCCCCC' }}
                        />
                        <Legend />
                        <Bar dataKey={dataKey} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                        <XAxis dataKey={xAxisKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#252526', borderColor: '#333333', color: '#CCCCCC' }}
                            itemStyle={{ color: '#CCCCCC' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey={dataKey} stroke="#8B5CF6" strokeWidth={2} dot={false} />
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                        <XAxis dataKey={xAxisKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#252526', borderColor: '#333333', color: '#CCCCCC' }}
                            itemStyle={{ color: '#CCCCCC' }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey={dataKey} stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    </AreaChart>
                );
            default:
                return null;
        }
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            {renderChart()!}
        </ResponsiveContainer>
    );
};
