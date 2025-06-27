// src/services/aws-auth.ts
import { Auth } from 'aws-amplify';
import { type User } from '../types';

/* --- helpers ------------------------------------------------------- */
type CognitoUser = {
  attributes: Record<string, string>;
  [key: string]: any;
};

const mapCognitoToUser = (c: CognitoUser): User => ({
  id: c.attributes.sub,
  email: c.attributes.email,
  name: c.attributes.name ?? '',
  created_at: c.attributes.created_at ?? new Date().toISOString(),
  last_login: new Date().toISOString(),
});

const prettyError = (e: any): Error =>
  new Error(
    e?.message ||
      e?.code ||
      'AWS Cognito error — please try again or contact support.'
  );

/* --- service ------------------------------------------------------- */
export class AWSAuthService {
  /* ---------------- sign-up ---------------- */
  static async signUp(
    email: string,
    password: string,
    name: string
  ): Promise<'CONFIRM_REQUIRED' | 'SIGNED_UP'> {
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: { email, name },
      });
      return 'CONFIRM_REQUIRED';
    } catch (error) {
      console.error('Sign-up error:', error);
      throw prettyError(error);
    }
  }

  /* ---------------- confirm ---------------- */
  static async confirmSignUp(
    email: string,
    code: string
  ): Promise<'CONFIRMED'> {
    try {
      await Auth.confirmSignUp(email, code);
      return 'CONFIRMED';
    } catch (error) {
      console.error('Confirm sign-up error:', error);
      throw prettyError(error);
    }
  }

  /* ---------------- sign-in ---------------- */
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const cognitoUser = (await Auth.signIn(
        email,
        password
      )) as CognitoUser;
      return mapCognitoToUser(cognitoUser);
    } catch (error) {
      console.error('Sign-in error:', error);
      throw prettyError(error);
    }
  }

  /* ---------------- sign-out ---------------- */
  static async signOut(): Promise<void> {
    try {
      await Auth.signOut({ global: true });
    } catch (error) {
      console.error('Sign-out error:', error);
      throw prettyError(error);
    }
  }

  /* ---------------- current user ------------ */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const cognitoUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
      return mapCognitoToUser(cognitoUser);
    } catch {
      return null;
    }
  }

  /* ---------------- JWT token --------------- */
  static async getJwtToken(): Promise<string | null> {
    try {
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch (error) {
      console.error('Get JWT token error:', error);
      return null;
    }
  }
}
