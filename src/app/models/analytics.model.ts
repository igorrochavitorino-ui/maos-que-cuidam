export interface SiteVisit {
  id: string;              // 'vis_log_timestamp_rand'
  visitorId: string;       // 'VIS-123456' (persistente por visitante)
  timestamp: string;       // ISO string
  date: string;            // 'YYYY-MM-DD'
  page: string;            // '/cadastro', '/', '/cursos', etc.
  pageTitle: string;       // 'Inscrições para Cursos', etc.
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;         // 'Chrome', 'Safari', 'Firefox', etc.
  os: string;              // 'Android', 'iOS', 'Windows', 'MacOS', etc.
  city?: string;           // 'Macaé/RJ' ou detectado
  referrer?: string;       // 'Direto', 'WhatsApp', 'Google', etc.
  isReturning: boolean;    // true se o visitante já havia acessado anteriormente
}

export interface AnalyticsSummary {
  todayTotal: number;
  todayUnique: number;
  weekTotal: number;
  weekUnique: number;
  monthTotal: number;
  monthUnique: number;
  yearTotal: number;
  yearUnique: number;
  allTimeTotal: number;
  allTimeUnique: number;
}
