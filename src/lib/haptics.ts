
import { isMobile } from "./utils";

/**
 * Provide haptic feedback based on action type
 * Falls back gracefully when haptics are not available
 */
export async function performHapticFeedback(type: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' = 'light') {
  try {
    if (isMobile()) {
      const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
      
      switch (type) {
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        default:
          await Haptics.impact({ style: ImpactStyle.Light });
      }
    }
  } catch (error) {
    // Silent fail when haptics are not available
    console.debug('Haptics not available:', error);
  }
}
