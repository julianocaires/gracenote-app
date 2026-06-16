import * as Notifications from 'expo-notifications'
import { Platform, Alert, Linking } from 'react-native'
import { sermonsService } from '../../sermons/services/sermons.service'
import { getSpecialDates, NOTIFICATION_MESSAGES } from '../constants'

// Unique identifiers for scheduled notifications
export const NOTIFICATION_IDS = {
  sunday: 'sunday-reminder',
  inactivity: 'inactivity-reminder',
  onThisDay: 'on-this-day',
  special: (label: string) => `special-${label.toLowerCase().replace(/\s/g, '-')}`,
} as const

// Configure how notifications behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

let permissionGranted = false

async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  permissionGranted = finalStatus === 'granted'

  if (!permissionGranted && existing !== 'denied') {
    console.warn('[Notifications] Permissão não concedida')
  }

  return permissionGranted
}

export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}

// --- Scheduling helpers ---

async function cancelByTag(tag: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const n of scheduled) {
    if (n.identifier === tag) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier)
    }
  }
}

async function cancelAllNotifications() {
  console.warn('[Notifications] Cancelando todas as notificações')
  await Notifications.cancelAllScheduledNotificationsAsync()
}

// --- Individual schedulers ---

async function scheduleSundayReminder() {
  await cancelByTag(NOTIFICATION_IDS.sunday)
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.sunday,
    content: {
      title: NOTIFICATION_MESSAGES.sundayReminder.title,
      body: NOTIFICATION_MESSAGES.sundayReminder.body,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 8,
      minute: 0,
    } as Notifications.NotificationTriggerInput,
  })
  console.warn('[Notifications] Lembrete de domingo agendado')
}

async function scheduleSpecialDates() {
  const dates = getSpecialDates()
  for (const d of dates) {
    const id = NOTIFICATION_IDS.special(d.label)
    await cancelByTag(id)
    // Only schedule if the date hasn't passed yet this year
    if (d.date >= new Date()) {
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: d.label,
          body: d.message,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          month: d.date.getMonth(),
          day: d.date.getDate(),
          hour: 9,
          minute: 0,
        } as Notifications.NotificationTriggerInput,
      })
    }
  }
  console.warn('[Notifications] Datas especiais agendadas:', dates.length)
}

async function scheduleOnThisDay(userId: string) {
  await cancelByTag(NOTIFICATION_IDS.onThisDay)
  try {
    const sermons = await sermonsService.getOnThisDay(userId)
    if (sermons.length === 0) return

    const now = new Date()
    const s = sermons[0] // Most recent one
    const years = now.getFullYear() - new Date(s.created_at).getFullYear()
    const msg = NOTIFICATION_MESSAGES.onThisDay(s.title, years)

    // Schedule for 2 hours from now — if user doesn't open the app, it fires
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.onThisDay,
      content: {
        title: msg.title,
        body: msg.body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2 * 60 * 60,
      } as Notifications.NotificationTriggerInput,
    })
    console.warn('[Notifications] Neste Dia agendado:', s.title)
  } catch (err) {
    console.warn('[Notifications] Neste Dia — sem sermões ou offline')
  }
}

async function scheduleInactivityReminder() {
  await cancelByTag(NOTIFICATION_IDS.inactivity)
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.inactivity,
    content: {
      title: NOTIFICATION_MESSAGES.inactivity.title,
      body: NOTIFICATION_MESSAGES.inactivity.body,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3 * 24 * 60 * 60, // 3 days
    } as Notifications.NotificationTriggerInput,
  })
  console.warn('[Notifications] Lembrete de inatividade agendado para 3 dias')
}

// --- Public API ---

export const notificationsService = {
  /** Initialize: request permissions, set up Android channel */
  init: async () => {
    const ok = await requestPermissions()
    if (!ok) return false

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'GraceNote',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      })
    }

    return true
  },

  /** Schedule all notification types */
  scheduleAll: async (userId: string) => {
    if (!permissionGranted) {
      const ok = await requestPermissions()
      if (!ok) return
    }

    await scheduleSundayReminder()
    await scheduleSpecialDates()
    await scheduleOnThisDay(userId)
    await scheduleInactivityReminder()
    console.warn('[Notifications] Todas as notificações agendadas')
  },

  /** Cancel all scheduled notifications */
  cancelAll: cancelAllNotifications,

  /** Called when app comes to foreground — reschedule inactivity reminder */
  onAppActive: async (userId: string) => {
    if (!permissionGranted) return
    // Cancel the inactivity reminder (user just opened the app)
    await cancelByTag(NOTIFICATION_IDS.inactivity)
    // Reschedule "On This Day" check
    await scheduleOnThisDay(userId)
  },

  /** Called when app goes to background — schedule inactivity reminder */
  onAppBackground: async () => {
    if (!permissionGranted) return
    await scheduleInactivityReminder()
  },

  isPermissionGranted: () => permissionGranted,
}
