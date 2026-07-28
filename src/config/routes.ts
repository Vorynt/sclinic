export const routes = {
  landing: "/",
  login: "/login",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  changePassword: "/change-password",
  invite: "/invite",
  professionalInvite: "/invite/professional",
  onboardingPlan: "/onboarding/plan",
  onboardingClinic: "/onboarding/clinic",
  onboardingHours: "/onboarding/hours",
  membershipInactive: "/membership-inactive",
  selectClinic: "/select-clinic",
  home: "/home",
  users: "/users",
  patients: "/patients",
  patientDetail: (patientId: string) => `/patients/${patientId}`,
  patientDetailProfile: (patientId: string) =>
    `/patients/${patientId}/profile`,
  patientDetailAppointments: (patientId: string) =>
    `/patients/${patientId}/appointments`,
  patientDetailNotes: (patientId: string) => `/patients/${patientId}/notes`,
  patientDetailVitals: (patientId: string) => `/patients/${patientId}/vitals`,
  patientDetailPrescriptions: (patientId: string) =>
    `/patients/${patientId}/prescriptions`,
  professionals: "/professionals",
  billing: "/billing",
  appointments: "/appointments",
  appointmentAttendance: (appointmentId: string) =>
    `/appointments/${appointmentId}/attendance`,
  appointmentAttendanceNotes: (appointmentId: string) =>
    `/appointments/${appointmentId}/attendance/notes`,
  appointmentAttendanceVitals: (appointmentId: string) =>
    `/appointments/${appointmentId}/attendance/vitals`,
  appointmentAttendancePrescriptions: (appointmentId: string) =>
    `/appointments/${appointmentId}/attendance/prescriptions`,
  prescriptionPrint: (prescriptionId: string, options?: { autoPrint?: boolean }) => {
    const base = `/prescriptions/${prescriptionId}/print`
    if (options?.autoPrint === false) return `${base}?preview=1`
    return base
  },
  account: "/account",
  accountOverview: "/account/overview",
  accountProfile: "/account/profile",
  accountSecurity: "/account/security",
  accountSubscription: "/account/subscription",
  settings: "/settings",
  settingsGeneral: "/settings/general",
  settingsHours: "/settings/hours",
  settingsPrescriptions: "/settings/prescriptions",
  settingsUsage: "/settings/usage",
  settingsAudit: "/settings/audit",
  settingsDanger: "/settings/danger",
  /** Placeholder until the help page exists. */
  help: "/help",
} as const
