/** Static demo data for landing product mocks — not real domain entities. */

export const MOCK_PROFESSIONAL_COLORS = [
  "#93C5FD",
  "#86EFAC",
  "#FCD34D",
  "#FCA5A5",
] as const

export const MOCK_NAV_ITEMS = [
  { label: "Início", active: false },
  { label: "Pacientes", active: false },
  { label: "Profissionais", active: false },
  { label: "Agenda", active: true },
] as const

export const MOCK_CLINIC_NAME = "Clínica Horizonte"

export type MockAgendaEvent = {
  id: string
  patientName: string
  professionalName: string
  colorIndex: number
  /** Day column 0–4 (Seg–Sex) */
  day: number
  /** Start hour as decimal (e.g. 9.5 = 09:30) */
  startHour: number
  durationHours: number
  timeLabel: string
}

export const MOCK_WEEK_DAYS = [
  { label: "seg", day: 21, isToday: false },
  { label: "ter", day: 22, isToday: false },
  { label: "qua", day: 23, isToday: true },
  { label: "qui", day: 24, isToday: false },
  { label: "sex", day: 25, isToday: false },
] as const

export const MOCK_HOUR_MARKS = [8, 9, 10, 11, 12] as const

export const MOCK_AGENDA_EVENTS: MockAgendaEvent[] = [
  {
    id: "e1",
    patientName: "Ana Souza",
    professionalName: "Dra. Camila",
    colorIndex: 0,
    day: 0,
    startHour: 9,
    durationHours: 1,
    timeLabel: "09:00–10:00",
  },
  {
    id: "e2",
    patientName: "Bruno Lima",
    professionalName: "Dr. Rafael",
    colorIndex: 1,
    day: 1,
    startHour: 8.5,
    durationHours: 0.75,
    timeLabel: "08:30–09:15",
  },
  {
    id: "e3",
    patientName: "Carla Mendes",
    professionalName: "Dra. Camila",
    colorIndex: 0,
    day: 2,
    startHour: 10,
    durationHours: 1,
    timeLabel: "10:00–11:00",
  },
  {
    id: "e4",
    patientName: "Diego Alves",
    professionalName: "Enf. Paula",
    colorIndex: 2,
    day: 2,
    startHour: 8,
    durationHours: 0.5,
    timeLabel: "08:00–08:30",
  },
  {
    id: "e5",
    patientName: "Elena Costa",
    professionalName: "Dr. Rafael",
    colorIndex: 1,
    day: 3,
    startHour: 11,
    durationHours: 1,
    timeLabel: "11:00–12:00",
  },
  {
    id: "e6",
    patientName: "Fábio Nunes",
    professionalName: "Dra. Camila",
    colorIndex: 0,
    day: 4,
    startHour: 9.5,
    durationHours: 0.75,
    timeLabel: "09:30–10:15",
  },
]

export const MOCK_ATTENDANCE = {
  patientName: "Carla Mendes",
  status: "Em atendimento",
  type: "Consulta",
  datetime: "quarta-feira, 23 de julho de 2026 · 10:00–11:00 · Dra. Camila",
  alerts: [
    { label: "Alergia: Dipirona", severity: "high" as const },
    { label: "Restrição: Jejum", severity: "medium" as const },
  ],
  nav: [
    { label: "Resumo", description: "Visão geral", active: false },
    { label: "Sinais vitais", description: "PA, FC, IMC", active: true },
    { label: "Anotações", description: "Notas clínicas", active: false },
  ],
  vitals: {
    bloodPressure: "128 / 82",
    heartRate: "72",
    temperature: "36,5",
    weight: "68,0",
    height: "165",
    spo2: "98",
    bmi: "25,0",
  },
}

export const MOCK_PATIENTS = [
  {
    name: "Ana Souza",
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
    email: "ana.souza@email.com",
  },
  {
    name: "Bruno Lima",
    cpf: "234.567.890-11",
    phone: "(11) 97654-3210",
    email: "bruno.lima@email.com",
  },
  {
    name: "Carla Mendes",
    cpf: "345.678.901-22",
    phone: "(11) 96543-2109",
    email: "carla.mendes@email.com",
  },
  {
    name: "Diego Alves",
    cpf: "456.789.012-33",
    phone: "(11) 95432-1098",
    email: "—",
  },
  {
    name: "Elena Costa",
    cpf: "567.890.123-44",
    phone: "(11) 94321-0987",
    email: "elena.costa@email.com",
  },
  {
    name: "Fábio Nunes",
    cpf: "678.901.234-55",
    phone: "(11) 93210-9876",
    email: "fabio.nunes@email.com",
  },
] as const

export function mockEventColor(colorIndex: number): string {
  return (
    MOCK_PROFESSIONAL_COLORS[colorIndex % MOCK_PROFESSIONAL_COLORS.length] ??
    MOCK_PROFESSIONAL_COLORS[0]
  )
}
