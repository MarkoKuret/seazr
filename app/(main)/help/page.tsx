import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth-action';
import { SiteHeader } from '@/components/site-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

export default async function HelpPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <SiteHeader title='Help & Support' />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='flex items-center justify-between px-4 lg:px-6'>
              <h1 className='text-2xl font-semibold'>FAQ</h1>
            </div>

            <div className='px-4 lg:px-6'>
              <Card>
                <CardContent>
                  <Accordion type='single' collapsible className='w-full'>
                    <AccordionItem value='item-1'>
                      <AccordionTrigger>
                        How do I add a new vessel?
                      </AccordionTrigger>
                      <AccordionContent>
                        You can add a new vessel by going to the &quot;Manage
                        Vessels&quot; page and clicking on the &quot;Add New
                        Vessel&quot; button. Fill in the required information
                        including vessel name and ID, then click &quot;Add
                        Vessel&quot;.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value='item-2'>
                      <AccordionTrigger>
                        How does Seazr connect to my existing sensors?
                      </AccordionTrigger>
                      <AccordionContent>
                        Seazr hub device connects to your existing marine
                        sensors through standard NMEA 2000, NMEA 0183, or direct
                        sensor interfaces. Once connected, the hub transmits
                        data over cellular or Wi-Fi networks to our cloud
                        platform.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value='item-3'>
                      <AccordionTrigger>
                        What happens if my boat loses connectivity?
                      </AccordionTrigger>
                      <AccordionContent>
                        The Seazr hub will continue to monitor and store sensor
                        data locally when connectivity is lost. When the
                        connection is restored, the hub will sync the stored
                        data to the cloud, ensuring you have a complete history.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
