export type AuthErrorCode =
  | "Configuration"
  | "AccessDenied"
  | "Verification"
  | "OAuthSignin"
  | "OAuthCallback"
  | "OAuthCreateAccount"
  | "EmailCreateAccount"
  | "Callback"
  | "OAuthAccountNotLinked"
  | "EmailSignin"
  | "CredentialsSignin"
  | "SessionRequired"
  | "Default"

export interface AuthErrorContent {
  title: string
  description: string
  showSignup?: boolean
}

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, AuthErrorContent> = {
  Configuration: {
    title: "Setup issue",
    description:
      "Sign-in isn't configured correctly on our side. Please try again later or contact support.",
  },
  AccessDenied: {
    title: "Access denied",
    description:
      "You don't have permission to sign in this way. If you think this is a mistake, contact support.",
  },
  Verification: {
    title: "Link expired",
    description:
      "This sign-in link is no longer valid. Request a new one and try again.",
  },
  OAuthSignin: {
    title: "Couldn't connect to Google",
    description:
      "We couldn't start Google sign-in. Check your connection and try again.",
  },
  OAuthCallback: {
    title: "Google sign-in failed",
    description:
      "Something went wrong while finishing Google sign-in. Please try again.",
  },
  OAuthCreateAccount: {
    title: "Couldn't create your account",
    description:
      "We couldn't finish creating your account with Google. Please try again.",
  },
  EmailCreateAccount: {
    title: "Couldn't create your account",
    description:
      "We couldn't create an account with this email. It may already be registered.",
    showSignup: true,
  },
  Callback: {
    title: "Sign-in interrupted",
    description:
      "Something went wrong during sign-in. Please try again in a moment.",
  },
  OAuthAccountNotLinked: {
    title: "Use your original sign-in method",
    description:
      "This email is already registered with email and password. Log in that way, or reset your password if needed.",
  },
  EmailSignin: {
    title: "Email sign-in failed",
    description:
      "We couldn't complete email sign-in. Request a new link and try again.",
  },
  CredentialsSignin: {
    title: "Invalid email or password",
    description:
      "The credentials you entered don't match an account. Check your details or create a new account.",
    showSignup: true,
  },
  SessionRequired: {
    title: "Sign in required",
    description: "You need to be signed in to open that page.",
  },
  Default: {
    title: "Something went wrong",
    description:
      "We couldn't complete sign-in. Please try again or use a different method.",
  },
}

export function getAuthErrorContent(error?: string | null): AuthErrorContent & {
  code: AuthErrorCode
} {
  const code = (error as AuthErrorCode) ?? "Default"
  const content = AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.Default
  return { code, ...content }
}
