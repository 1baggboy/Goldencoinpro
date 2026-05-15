import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './EmailService';
import { auth, db } from '../lib/firebase';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
const TOKEN_EXPIRY = '1h';

export class AuthService {
  static async register(data: any) {
    if (!auth || !db) throw new Error("Firebase Admin not initialized");
    const { email, password, firstName, lastName } = data;
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName || ''} ${lastName || ''}`.trim(),
    });

    // Create user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      role: 'USER',
      isEmailVerified: false,
      isSuspended: false,
      balance: 0,
      tradingBalance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userObj = {
      id: userRecord.uid,
      email: userRecord.email,
      firstName,
      role: 'USER'
    };

    // Send verification email
    const otp = await this.generateOTP(userRecord.uid, 'VERIFY_EMAIL');
    await EmailService.sendOTP(userObj, otp, 'Email Verification');

    return this.generateTokens(userObj);
  }

  static async login(email: string, idToken: string, deviceDetails: any) {
    if (!auth || !db) throw new Error("Firebase Admin not initialized");
    
    // the idToken should be verified to confirm login via client SDK
    const decodedToken = await auth.verifyIdToken(idToken);
    if (!decodedToken.email || decodedToken.email !== email) throw new Error("Invalid token.");

    const uid = decodedToken.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) throw new Error("User not found in database.");

    const userData = userDoc.data() as any;

    if (userData.isSuspended) throw new Error("Account suspended. Please contact support.");

    const userObj = {
      id: uid,
      email: userData.email,
      firstName: userData.firstName,
      role: userData.role || 'USER'
    };

    // Detect new device
    const deviceQuery = await db.collection('devices')
      .where('userId', '==', uid)
      .where('deviceId', '==', deviceDetails.deviceId)
      .limit(1)
      .get();

    if (deviceQuery.empty) {
      await db.collection('devices').add({
        userId: uid,
        deviceId: deviceDetails.deviceId,
        deviceString: deviceDetails.deviceString,
        browser: deviceDetails.browser,
        os: deviceDetails.os,
        ip: deviceDetails.ip,
        location: deviceDetails.location,
        createdAt: new Date(),
        lastLogin: new Date(),
        isTrusted: false
      });
      // Send login alert for new device
      await EmailService.sendLoginAlert(userObj, deviceDetails);
    } else {
      const deviceIdDb = deviceQuery.docs[0].id;
      await db.collection('devices').doc(deviceIdDb).update({
        lastLogin: new Date(),
        ip: deviceDetails.ip,
        location: deviceDetails.location
      });
    }

    await db.collection('activityLogs').add({
      userId: uid,
      action: 'LOGIN',
      ip: deviceDetails.ip,
      userAgent: deviceDetails.userAgent,
      createdAt: new Date()
    });

    return this.generateTokens(userObj);
  }

  private static generateTokens(user: any) {
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    const refreshToken = uuidv4();
    
    return { accessToken, refreshToken, user: { 
      id: user.id, email: user.email, firstName: user.firstName, role: user.role 
    }};
  }

  static async generateOTP(userId: string, type: string) {
    if (!db) throw new Error("Firebase Admin not initialized");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await db.collection('otps').add({
      userId,
      code,
      type,
      expiresAt,
      isUsed: false,
      createdAt: new Date()
    });

    return code;
  }

  static async verifyOTP(userId: string, code: string, type: string) {
    if (!db) throw new Error("Firebase Admin not initialized");
    const otpsRef = db.collection('otps');
    const snapshot = await otpsRef
      .where('userId', '==', userId)
      .where('code', '==', code)
      .where('type', '==', type)
      .where('isUsed', '==', false)
      .get();

    if (snapshot.empty) {
      throw new Error("Invalid or expired code.");
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    if (data.expiresAt.toDate() < new Date()) {
      throw new Error("Invalid or expired code.");
    }

    await doc.ref.update({ isUsed: true });
    return true;
  }

  static async verifyEmail(userId: string, code: string) {
    if (!db) throw new Error("Firebase Admin not initialized");
    await this.verifyOTP(userId, code, 'VERIFY_EMAIL');
    await db.collection('users').doc(userId).update({
      isEmailVerified: true
    });
    return { success: true, message: "Email verified successfully." };
  }

  static async forgotPassword(email: string) {
    if (!auth || !db) throw new Error("Firebase Admin not initialized");
    // Find user by email
    try {
      const userRecord = await auth.getUserByEmail(email);
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.collection('otps').add({
        userId: userRecord.uid,
        code: token, // Using OTP table to store reset token
        type: 'RESET_PASSWORD',
        expiresAt,
        isUsed: false,
        createdAt: new Date()
      });

      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userObj = { ...userDoc.data(), id: userRecord.uid };

      await EmailService.sendPasswordReset(userObj, token);
    } catch (error) {
       // if user not found, ignore to not reveal existence
    }
    return { success: true, message: "Password reset link sent." };
  }

  static async resetPassword(token: string, newPassword: string) {
    if (!auth || !db) throw new Error("Firebase Admin not initialized");
    const snapshot = await db.collection('otps')
      .where('code', '==', token)
      .where('type', '==', 'RESET_PASSWORD')
      .where('isUsed', '==', false)
      .get();

    if (snapshot.empty) throw new Error("Invalid or expired reset token.");

    const doc = snapshot.docs[0];
    const data = doc.data();
    if (data.expiresAt.toDate() < new Date()) {
      throw new Error("Invalid or expired reset token.");
    }

    const userId = data.userId;

    // update password via firebase admin
    await auth.updateUser(userId, { password: newPassword });

    await doc.ref.update({ isUsed: true });

    const userDoc = await db.collection('users').doc(userId).get();
    const userObj = { ...userDoc.data(), id: userId };

    await EmailService.sendSecurityAlert(userObj, "Your password was recently changed.");
    
    return { success: true, message: "Password reset successfully." };
  }
}

