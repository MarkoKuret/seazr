'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Define the chart config for different sensor types
const chartConfig = {
  battery: {
    label: 'Battery',
    color: '#4ade80', // Green color for battery
  },
  temperature: {
    label: 'Temperature',
    color: '#f97316', // Orange for temperature
  },
  humidity: {
    label: 'Humidity',
    color: '#3b82f6', // Blue for humidity
  },
  pressure: {
    label: 'Pressure',
    color: '#8b5cf6', // Purple for pressure
  },
  water_level: {
    label: 'Water Level',
    color: '#06b6d4', // Cyan for water level
  },
} satisfies ChartConfig;

// Define available sensor types
const sensorTypes = [
  { id: 'voltage', label: 'Battery', unit: 'V' },
  { id: 'temperature', label: 'Temperature', unit: '°C' },
  { id: 'humidity', label: 'Humidity', unit: '%' },
  { id: 'pressure', label: 'Pressure', unit: 'hPa' },
  { id: 'water_level', label: 'Water Level', unit: '%' },
];

type SensorData = {
  date: string;
  value: number;
  vesselId: string;
  type?: string; // For future use if we expand beyond battery data
}

export function ChartAreaInteractive({ batteryData = [] }: { batteryData: SensorData[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('30d');
  const [selectedVessel, setSelectedVessel] = React.useState<string>('all');
  const [selectedSensorType, setSelectedSensorType] = React.useState<string>('voltage');

  // Extract unique vessel IDs from data
  const uniqueVessels = React.useMemo(() => {
    const vessels = new Set(batteryData.map(item => item.vesselId));
    return Array.from(vessels);
  }, [batteryData]);

  // Get the sensor unit for the selected type
  const selectedSensorUnit = React.useMemo(() => {
    return sensorTypes.find(s => s.id === selectedSensorType)?.unit || 'V';
  }, [selectedSensorType]);

  // Get display name for selected sensor
  const selectedSensorLabel = React.useMemo(() => {
    return sensorTypes.find(s => s.id === selectedSensorType)?.label || 'Battery';
  }, [selectedSensorType]);

  const filteredData = React.useMemo(() => {
    const days = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return batteryData.filter(item => {
      // Filter by date
      const dateFilter = new Date(item.date) >= cutoffDate;

      // Filter by vessel if not "all"
      const vesselFilter = selectedVessel === 'all' || item.vesselId === selectedVessel;

      // Simplified type filtering - match exactly what was selected or handle the special battery/voltage case
      const typeFilter =
        item.type === selectedSensorType ||
        (selectedSensorType === 'voltage' && item.type === 'battery') ||
        (item.type === 'voltage' && selectedSensorType === 'battery');

      return dateFilter && vesselFilter && typeFilter;
    });
  }, [batteryData, timeRange, selectedVessel, selectedSensorType]);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex-grow">
              <div className="flex gap-2 items-center">
                <span>{selectedSensorLabel} Data</span>
              </div>
            </CardTitle>
            <div className="flex gap-2 mr-2">
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger className="w-32" size="sm">
                  <SelectValue placeholder="All Vessels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  {uniqueVessels.map(vesselId => (
                    <SelectItem key={vesselId} value={vesselId}>
                      Vessel {vesselId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSensorType} onValueChange={setSelectedSensorType}>
                <SelectTrigger className="w-32" size="sm">
                  <SelectValue placeholder="Battery" />
                </SelectTrigger>
                <SelectContent>
                  {sensorTypes.map(sensor => (
                    <SelectItem key={sensor.id} value={sensor.id}>
                      {sensor.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              {selectedSensorLabel} readings over time
              {selectedVessel !== 'all' && ` for vessel ${selectedVessel}`}
            </span>
            <span className='@[540px]/card:hidden'>Sensor history</span>
          </CardDescription>
        </div>
        <CardAction>
          <ToggleGroup
            type='single'
            value={timeRange}
            onValueChange={setTimeRange}
            variant='outline'
            className='hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex'
          >
            <ToggleGroupItem value='90d'>Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value='30d'>Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value='7d'>Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className='flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden'
              size='sm'
              aria-label='Select a time range'
            >
              <SelectValue placeholder='Last 30 days' />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              <SelectItem value='90d' className='rounded-lg'>
                Last 3 months
              </SelectItem>
              <SelectItem value='30d' className='rounded-lg'>
                Last 30 days
              </SelectItem>
              <SelectItem value='7d' className='rounded-lg'>
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id='fillSensor' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor={`var(--color-${selectedSensorType === 'voltage' ? 'battery' : selectedSensorType})`}
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor={`var(--color-${selectedSensorType === 'voltage' ? 'battery' : selectedSensorType})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  }}
                  indicator='dot'
                  formatter={(value) => (
                    <span>{value.toFixed(2)} {selectedSensorUnit}</span>
                  )}
                />
              }
            />
            <Area
              dataKey='value'
              type='monotone'
              fill='url(#fillSensor)'
              stroke={`var(--color-${selectedSensorType === 'voltage' ? 'battery' : selectedSensorType})`}
              name={selectedSensorLabel}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
