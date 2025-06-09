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
import { SensorReading, SensorType } from '@/types';
import { getUnitForSensorType, getSensorTypeLabel, getSensorTypeColor } from '@/lib/utils';

// Available sensor types for the dropdown
const SENSOR_TYPES: SensorType[] = ['voltage', 'temperature', 'humidity', 'pressure', 'water', 'fuel', 'battery'];

interface ChartAreaInteractiveProps {
  sensorData: SensorReading[];
}

export function ChartAreaInteractive({
  sensorData = [],
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('30d');
  const [selectedVessel] = React.useState<string>('all');
  const [selectedSensorType, setSelectedSensorType] =
    React.useState<SensorType>('voltage');

  // Get the sensor unit for the selected type
  const selectedSensorUnit = React.useMemo(() =>
    getUnitForSensorType(selectedSensorType),
    [selectedSensorType]
  );

  // Get display name for selected sensor
  const selectedSensorLabel = React.useMemo(() =>
    getSensorTypeLabel(selectedSensorType),
    [selectedSensorType]
  );

  // Get sensor color for visualization
  const sensorColor = React.useMemo(() =>
    getSensorTypeColor(selectedSensorType),
    [selectedSensorType]
  );

  // Create chart config for the selected sensor
  const chartConfig = React.useMemo(() => ({
    [selectedSensorType]: {
      label: selectedSensorLabel,
      color: sensorColor,
      unit: selectedSensorUnit
    }
  }), [selectedSensorType, selectedSensorLabel, sensorColor, selectedSensorUnit]);

  const filteredData = React.useMemo(() => {
    const cutoffDate = new Date();

    if (timeRange === '30d') {
      cutoffDate.setDate(cutoffDate.getDate() - 30);
    } else if (timeRange === '7d') {
      cutoffDate.setDate(cutoffDate.getDate() - 7);
    } else if (timeRange === '1d') {
      cutoffDate.setDate(cutoffDate.getDate() - 1);
    }

    return sensorData.filter((item) => {
      // Filter by date
      const dateFilter = new Date(item.time) >= cutoffDate;

      // Type filtering with special handling for battery/voltage
      const typeFilter =
        item.type === selectedSensorType ||
        (selectedSensorType === 'voltage' && item.type === 'battery') ||
        (item.type === 'voltage' && selectedSensorType === 'battery');

      return dateFilter && typeFilter;
    });
  }, [sensorData, timeRange, selectedSensorType]);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex-grow'>
              <div className='flex items-center gap-2'>
                <span>{selectedSensorLabel}</span>
              </div>
            </CardTitle>
            <div className='mr-2 flex gap-2'>
              <Select
                value={selectedSensorType}
                onValueChange={(value) =>
                  setSelectedSensorType(value as SensorType)
                }
              >
                <SelectTrigger className='w-24 md:w-32' size='sm'>
                  <SelectValue placeholder={getSensorTypeLabel('voltage')} />
                </SelectTrigger>
                <SelectContent>
                  {SENSOR_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getSensorTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            <span className='hidden @[540px]/card:block'> {/* ?! */}
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
            <ToggleGroupItem value='30d'>30 days</ToggleGroupItem>
            <ToggleGroupItem value='7d'>7 days</ToggleGroupItem>
            <ToggleGroupItem value='1d'>24 hours</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className='flex w-22 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden'
              size='sm'
              aria-label='Select a time range'
            >
              <SelectValue placeholder='30 days' />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              <SelectItem value='30d' className='rounded-lg'>
                30 d
              </SelectItem>
              <SelectItem value='7d' className='rounded-lg'>
                7 d
              </SelectItem>
              <SelectItem value='1d' className='rounded-lg'>
                24 h
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          className='aspect-auto h-[250px] w-full'
          config={chartConfig}
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id='fillSensor' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor={sensorColor}
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor={sensorColor}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='time'
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
              cursor={true }
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  }}
                  indicator='dot'
                  formatter={(value) => (
                    <span>
                      {value} {selectedSensorUnit}
                    </span>
                  )}
                />
              }
            />
            <Area
              dataKey='value'
              type='monotone'
              fill='url(#fillSensor)'
              stroke={sensorColor}
              name={selectedSensorLabel}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
