import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { db } from '../services/db';
import { Document } from '../types';
import { Loader2 } from 'lucide-react';
import { format, subDays } from 'date-fns';

export const Analytics = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const docs = await db.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to load analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // 1. Document Types Distribution
  const typeCount = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        name: 'Document Types',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
        data: Object.entries(typeCount).map(([name, value]) => ({ name, value })),
      },
    ],
    color: ['#4f46e5', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981']
  };

  // 2. Processing Status
  const statusCount = documents.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: Object.keys(statusCount) },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Count',
        type: 'bar',
        barWidth: '60%',
        data: Object.values(statusCount),
        itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] }
      }
    ],
  };

  // 3. Upload Volume (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, 'MMM dd');
  });

  const volumeData = last7Days.map(dayStr => {
    return documents.filter(d => format(new Date(d.uploadDate), 'MMM dd') === dayStr).length;
  });

  const lineChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: last7Days },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Uploads',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.1, color: '#4f46e5' },
        lineStyle: { color: '#4f46e5' },
        data: volumeData
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-slate-500">Insights into your document processing workflow.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={pieChartOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={barChartOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upload Volume (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={lineChartOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
