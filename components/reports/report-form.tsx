'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon, DownloadIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { generateVesselReport } from '@/server/report-action';
import { getUserVessels } from '@/server/vessel-action';

const reportFormSchema = z.object({
  vesselId: z.string({
    required_error: 'Please select a vessel',
  }),
  startDate: z.date({
    required_error: 'Please select a start date',
  }),
  endDate: z.date({
    required_error: 'Please select an end date',
  }),
});

export function ReportForm({ userId }: { userId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  type Vessel = { shortId: string; name: string };
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVessels() {
      try {
        setIsLoading(true);
        const data = await getUserVessels(userId);
        setVessels(data);
      } catch (error) {
        console.error('Failed to fetch vessels:', error);
        toast.error('Failed to load vessels');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVessels();
  }, [userId]);

  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof reportFormSchema>) {
    setIsGenerating(true);

    try {
      const vessel = vessels.find((v) => v.shortId === values.vesselId);
      if (!vessel) {
        throw new Error('Vessel not found');
      }

      const result = await generateVesselReport({
        userId,
        vesselShortId: values.vesselId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        vesselName: vessel.name,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.reportUrl) {
        // Create a hidden link and trigger download
        const link = document.createElement('a');
        link.href = result.reportUrl;
        link.download = `${vessel.name}-report-${format(values.startDate, 'yyyy-MM-dd')}-to-${format(values.endDate, 'yyyy-MM-dd')}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Generate Vessel Report</CardTitle>
        <CardDescription>
          Select a vessel and time period to generate a detailed report
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='mb-6 space-y-6'>
            <FormField
              control={form.control}
              name='vesselId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vessel</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a vessel' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vessels.map((vessel) => (
                        <SelectItem key={vessel.shortId} value={vessel.shortId}>
                          {vessel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('2020-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('2020-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type='submit' className='ml-auto' disabled={isGenerating}>
              {isGenerating ? (
                'Generating...'
              ) : (
                <>
                  <DownloadIcon className='mr-2 h-4 w-4' />
                  Generate Report
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
