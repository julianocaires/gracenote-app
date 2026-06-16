/** Compute Easter Sunday for a given year using Gauss's algorithm */
export function getEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export interface SpecialDate {
  label: string
  date: Date
  message: string
}

export function getSpecialDates(): SpecialDate[] {
  const year = new Date().getFullYear()
  const easter = getEaster(year)

  return [
    {
      label: 'Sexta-feira Santa',
      date: addDays(easter, -2),
      message: 'Hoje é Sexta-feira Santa. Um dia de reflexão sobre o sacrifício de Cristo. Que tal registrar uma ministração?',
    },
    {
      label: 'Páscoa',
      date: easter,
      message: 'Cristo ressuscitou! Feliz Páscoa! Celebre esta data escrevendo ou lendo uma ministração especial.',
    },
    {
      label: 'Pentecostes',
      date: addDays(easter, 49),
      message: 'Hoje é Pentecostes! Celebre a descida do Espírito Santo com uma ministração.',
    },
    {
      label: 'Natal',
      date: new Date(year, 11, 25),
      message: 'Feliz Natal! Que o nascimento de Cristo inspire sua ministração de hoje.',
    },
    {
      label: 'Ano Novo',
      date: new Date(year, 11, 31),
      message: 'Último dia do ano! Que tal registrar uma ministração de gratidão por tudo que Deus fez?',
    },
    {
      label: 'Ano Novo',
      date: new Date(year, 0, 1),
      message: 'Feliz Ano Novo! Comece o ano com uma ministração sobre seus propósitos para este novo ciclo.',
    },
  ]
}

export const NOTIFICATION_MESSAGES = {
  inactivity: {
    title: 'Saudades! 👋',
    body: 'Faz alguns dias que você não abre o GraceNote. Que tal criar ou ler uma ministração hoje?',
  },
  sundayReminder: {
    title: 'Domingo de ministração ⛪',
    body: 'Bom dia! Prepare-se para anotar os aprendizados do culto de hoje.',
  },
  onThisDay: (title: string, years: number) => ({
    title: 'Neste dia... 📖',
    body: years > 0
      ? `Há ${years} ano${years > 1 ? 's' : ''} você registrou "${title}". Releia esta ministração!`
      : `Você registrou "${title}" hoje! Confira.`,
  }),
} as const
