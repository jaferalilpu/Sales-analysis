# Drop Automatic Archiving System

## How It Works

The ULICA backend now includes an **automatic drop status management system** that handles the complete lifecycle of drops:

### Status Flow

```
upcoming → live → archived (immediately when ended)
```

### Automatic Status Updates

1. **Upcoming → Live**
   - When a drop's `startDate` arrives (becomes <= current time)
   - The drop automatically becomes "live"

2. **Live → Archived**
   - When a drop's `endDate` passes (becomes < current time)
   - The drop **immediately** moves to "archived" status
   - No waiting period - archived as soon as the end date passes

## Scheduled Job

A background job (`dropStatusMonitor`) runs automatically:

- **Default interval**: Every **60 minutes** (1 hour)
- **Runs on server startup**: Immediately checks and updates all drop statuses
- **Configurable**: Can be adjusted via environment variables

### Environment Variables

You can configure the monitoring behavior in your `.env` file:

```env
# Enable/disable the drop status monitor (default: true)
DROP_STATUS_MONITOR_ENABLED=true

# How often to check and update drop statuses (in minutes, default: 60)
DROP_STATUS_MONITOR_INTERVAL_MINUTES=60
```

**Note**: Drops are archived **immediately** when their end date passes - no waiting period.

## Manual Status Updates

The system also updates drop statuses **on-demand** when:
- Users visit `/api/drops` (public drops page)
- Users visit `/api/drops/current` (homepage)
- Admin views drops in the admin panel

This ensures statuses are always accurate, even if the scheduled job hasn't run recently.

## What Gets Archived?

- Drops with status `live` or `upcoming` whose `endDate` has passed
- Drops are archived **immediately** when their end date passes
- Only published drops are considered (unpublished drops are not auto-archived)

## Viewing Archived Drops

- **Admin Panel**: Filter by "Archived" status
- **Public Archive Page**: Visit `/drops?view=archive` or `/archive`
- **API**: Use `/api/drops?status=archived`

## Benefits

1. **Instant archiving**: Drops are archived immediately when they end - no waiting period
2. **Automatic cleanup**: Ended drops don't clutter the active drops list
3. **Accurate status**: Drops always show the correct status based on dates
4. **No manual work**: You don't need to manually archive old drops
5. **Configurable**: Adjust check interval based on your business needs

## Technical Details

- **Job file**: `backend/src/jobs/dropStatusMonitor.ts`
- **Service**: `backend/src/services/dropStatusService.ts`
- **Started in**: `backend/src/index.ts` (on server startup)
- **Graceful shutdown**: Job stops cleanly when server shuts down

## Monitoring

Check your server logs for messages like:
```
[DropStatusMonitor] Started (interval=60 minutes, drops archive immediately when ended)
[DropStatusService] Updated statuses: 2 → live, 3 → archived
[DropStatusService] Archived 2 legacy ended drop(s)
```

