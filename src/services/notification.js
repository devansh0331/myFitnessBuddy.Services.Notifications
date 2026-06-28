const { getFirestore, getMessaging } = require('../config/firebase');

class NotificationService {
  constructor() {
    this.db = getFirestore();
    this.messaging = getMessaging();
  }

  /**
   * Get yesterday's date as YYYY-MM-DD
   */
  getYesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  /**
   * Get today's date as YYYY-MM-DD
   */
  getTodayStr() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get all user IDs with push subscriptions
   */
  async getAllUserIds() {
    try {
      const snapshot = await this.db.collection('pushSubscriptions').get();
      const uids = [];
      snapshot.forEach(doc => uids.push(doc.id));
      console.log(`📋 Found ${uids.length} subscribed users`);
      return uids;
    } catch (error) {
      console.error('❌ Error fetching users:', error.message);
      return [];
    }
  }

  /**
   * Get user's workout status for a specific date
   */
  async getWorkoutStatus(uid, date) {
    try {
      const snapshot = await this.db.collection('workouts')
        .where('date', '==', date)
        .get();

      if (snapshot.empty) {
        return { status: 'No workout logged.', emoji: '😴' };
      }

      const doc = snapshot.docs[0];
      const data = doc.data();

      if (data.workoutType === 'Recovery' && data.isAutoRecovery) {
        return { status: 'Recovery day (auto-logged)', emoji: '🧘' };
      }

      if (data.workoutType) {
        const mins = data.durationMinutes || 0;
        return { 
          status: `${data.workoutType} workout (${mins} min)`, 
          emoji: '💪' 
        };
      }

      return { status: 'No workout logged.', emoji: '😴' };
    } catch (error) {
      console.error(`❌ Error fetching workout for ${uid}:`, error.message);
      return { status: 'Error fetching data', emoji: '⚠️' };
    }
  }

  /**
   * Send push notification to a single user
   */
  async sendNotification(uid, title, body) {
    try {
      const subDoc = await this.db.collection('pushSubscriptions').doc(uid).get();
      if (!subDoc.exists) {
        console.log(`❌ No subscription for user ${uid}`);
        return false;
      }

      const token = subDoc.data().fcmToken;
      if (!token) {
        console.log(`❌ No FCM token for user ${uid}`);
        return false;
      }

      const message = {
        notification: { title, body },
        token: token,
        android: { ttl: 86400000 },
        webpush: { headers: { TTL: '86400' } },
      };

      await this.messaging.send(message);
      console.log(`✅ Notification sent to ${uid}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send to ${uid}:`, error.message);
      return false;
    }
  }

  /**
   * Send Good Morning notifications to all users
   */
  async sendGoodMorning() {
    console.log('🌅 Sending Good Morning notifications...');
    const startTime = Date.now();

    const userIds = await this.getAllUserIds();
    if (userIds.length === 0) {
      console.log('📭 No users to notify');
      return;
    }

    const yesterday = this.getYesterdayStr();
    let successCount = 0;
    let failCount = 0;

    for (const uid of userIds) {
      try {
        const { status, emoji } = await this.getWorkoutStatus(uid, yesterday);
        const body = `Yesterday: ${emoji} ${status}`;
        const result = await this.sendNotification(uid, '🌅 Good Morning!', body);
        
        if (result) successCount++;
        else failCount++;
      } catch (error) {
        console.error(`Error processing user ${uid}:`, error.message);
        failCount++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`📊 Good Morning summary: ${successCount} sent, ${failCount} failed, ${duration}s`);
  }

  /**
   * Send Good Night notifications to all users
   */
  async sendGoodNight() {
    console.log('🌙 Sending Good Night notifications...');
    const startTime = Date.now();

    const userIds = await this.getAllUserIds();
    if (userIds.length === 0) {
      console.log('📭 No users to notify');
      return;
    }

    const title = '🌙 Good Night!';
    const body = 'Sleep well and recharge. Tomorrow is a new day to shine. ✨';

    let successCount = 0;
    let failCount = 0;

    for (const uid of userIds) {
      try {
        const result = await this.sendNotification(uid, title, body);
        if (result) successCount++;
        else failCount++;
      } catch (error) {
        console.error(`Error processing user ${uid}:`, error.message);
        failCount++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`📊 Good Night summary: ${successCount} sent, ${failCount} failed, ${duration}s`);
  }

  /**
   * Send a test notification to a specific user
   */
  async sendTestNotification(uid) {
    console.log(`🧪 Sending test notification to ${uid}`);
    return this.sendNotification(uid, '🧪 Test Notification', 'This is a test from your notification service!');
  }
}

module.exports = NotificationService;