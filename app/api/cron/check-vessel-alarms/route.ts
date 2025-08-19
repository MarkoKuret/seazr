import { NextRequest, NextResponse } from 'next/server';
import { getAllSensorValues } from '@/server/sensor-action';
import { determineVesselStatus } from '@/lib/vessel-status';
import { sendNotificationForVessel } from '@/server/notification-action';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting vessel alarm check...');

    // Get all vessels directly (no need to iterate through users)
    const allVessels = await prisma.vessel.findMany({
      include: {
        permissions: {
          include: {
            user: true,
          },
        },
      },
    });

    let totalAlarmsFound = 0;
    let totalNotificationsSent = 0;
    let totalEmailsSent = 0;
    const processedVessels: string[] = [];

    // Check each vessel once
    for (const vessel of allVessels) {
      try {
        // Skip if vessel has no users with permissions
        if (vessel.permissions.length === 0) {
          console.log(`Skipping vessel ${vessel.name} - no users with permissions`);
          continue;
        }

        // Get sensor readings using the first user with permissions
        // (all users with permissions should see the same sensor data)
        const firstUserId = vessel.permissions[0].userId;
        const sensorReadings = await getAllSensorValues(firstUserId, vessel.shortId);
        const healthStatus = determineVesselStatus(sensorReadings);

        if (healthStatus.status === 'alarm') {
          totalAlarmsFound++;
          processedVessels.push(vessel.name);

          const alarmMessages = healthStatus.description
            .filter(desc => desc.status === 'alarm')
            .map(desc => desc.text)
            .join(', ');

          const notificationTitle = `🚨 Vessel Alert: ${vessel.name}`;
          const notificationBody = `Critical issues detected: ${alarmMessages}`;

          // Send notification specifically for this vessel
          const result = await sendNotificationForVessel(
            vessel.id,
            vessel.name,
            notificationTitle,
            notificationBody
          );

          if (result?.success) {
            if (result.notificationsSent > 0) {
              totalNotificationsSent += result.notificationsSent;
            }
            if (result.emailsSent > 0) {
              totalEmailsSent += result.emailsSent;
            }
            console.log(`Sent ${result.notificationsSent || 0} push notifications and ${result.emailsSent || 0} emails for vessel: ${vessel.name}`);
          } else {
            console.log(`No notifications sent for vessel: ${vessel.name}`);
          }
        }
      } catch (error) {
        console.error(`Error checking vessel ${vessel.name}:`, error);
      }
    }

    console.log(`Vessel alarm check completed. Found ${totalAlarmsFound} alarms, sent ${totalNotificationsSent} push notifications and ${totalEmailsSent} emails.`);
    console.log(`Processed vessels with alarms: ${processedVessels.join(', ')}`);

    return NextResponse.json({
      success: true,
      alarmsFound: totalAlarmsFound,
      notificationsSent: totalNotificationsSent,
      emailsSent: totalEmailsSent,
      vesselsWithAlarms: processedVessels,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in vessel alarm check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
