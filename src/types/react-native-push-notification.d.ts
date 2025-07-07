/**
 * Type definitions for react-native-push-notification
 */
declare module 'react-native-push-notification' {
  export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
    vibration?: number;
    enableLights?: boolean;
    lightColor?: string;
    showBadge?: boolean;
  }

  export interface PushNotificationObject {
    id?: string | number;
    channelId?: string;
    ticker?: string;
    title?: string;
    message: string;
    picture?: string;
    actions?: string;
    priority?: string;
    sound?: string;
    tag?: string;
    alert?: string;
    ongoing?: boolean;
    smallIcon?: string;
    largeIcon?: string;
    color?: string;
    vibrate?: boolean;
    vibration?: number;
    playSound?: boolean;
    visibility?: 'private' | 'public' | 'secret';
    importance?: 'default' | 'max' | 'high' | 'low' | 'min' | 'none' | 'unspecified';
    allowWhileIdle?: boolean;
    ignoreInForeground?: boolean;
    invokeApp?: boolean;
    timeoutAfter?: number;
    onlyAlertOnce?: boolean;
    repeatTime?: number;
    repeatType?: 'time' | 'week' | 'day' | 'hour' | 'minute';
    when?: Date | number;
    usesChronometer?: boolean;
    messageId?: string;
    date?: Date;
    data?: Object;
    userInfo?: Object;
    autoCancel?: boolean;
    subtitle?: string;
    number?: number;
    bigText?: string;
    bigPictureUrl?: string;
  }

  export interface ConfigureOptions {
    onRegister?: (token: { os: string; token: string }) => void;
    onNotification?: (notification: any) => void;
    onAction?: (notification: any) => void;
    onRegistrationError?: (error: any) => void;
    onRemoteFetch?: (notification: any) => void;
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export default class PushNotification {
    static configure(options: ConfigureOptions): void;
    static createChannel(channel: ChannelObject, callback?: (created: boolean) => void): void;
    static deleteChannel(channelId: string): void;
    static channelExists(channelId: string, callback: (exists: boolean) => void): void;
    static getChannels(callback: (channels: Array<{ id: string }>) => void): void;
    static localNotification(details: PushNotificationObject): void;
    static localNotificationSchedule(details: PushNotificationObject): void;
    static cancelLocalNotifications(details: object): void;
    static cancelLocalNotification(details: { id: string | number }): void;
    static cancelAllLocalNotifications(): void;
    static setApplicationIconBadgeNumber(badgeCount: number): void;
    static getApplicationIconBadgeNumber(callback: (badgeCount: number) => void): void;
    static checkPermissions(
      callback: (permissions: { alert: boolean; badge: boolean; sound: boolean }) => void
    ): void;
    static requestPermissions(
      permissions?: Array<string> | { alert?: boolean; badge?: boolean; sound?: boolean }
    ): Promise<{ alert: boolean; badge: boolean; sound: boolean }>;
    static abandonPermissions(): void;
    static getInitialNotification(): Promise<any>;
    static clearAllNotifications(): void;
    static removeAllDeliveredNotifications(): void;
    static removeDeliveredNotifications(identifiers: Array<string>): void;
  }
}
