import { Injectable, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { SiteVisit, AnalyticsSummary } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private router = inject(Router);
  private firebaseService = inject(FirebaseService);

  private readonly VISITOR_ID_KEY = 'mqc_site_visitor_id';
  private readonly VISITS_STORAGE_KEY = 'mqc_site_visits_cache';
  private readonly LAST_VISIT_KEY = 'mqc_last_page_visit';
  private readonly VISITOR_FIRST_SEEN_KEY = 'mqc_first_seen';

  // Signals
  visits = signal<SiteVisit[]>([]);
  visitorId = signal<string>('');

  // Identificador de sessão para controle de navegação
  private lastTrackedUrl = '';
  private lastTrackedTime = 0;

  constructor() {
    this.initVisitorId();
    this.loadCachedVisits();
    this.initRealtimeSync();
    this.startTracking();
  }

  /**
   * Inicializa ou recupera o ID único anônimo do visitante no navegador
   */
  private initVisitorId(): void {
    try {
      let id = localStorage.getItem(this.VISITOR_ID_KEY);
      if (!id) {
        const rand = Math.floor(100000 + Math.random() * 900000);
        id = `VIS-${rand}`;
        localStorage.setItem(this.VISITOR_ID_KEY, id);
        localStorage.setItem(this.VISITOR_FIRST_SEEN_KEY, new Date().toISOString());
      }
      this.visitorId.set(id);
    } catch {
      this.visitorId.set(`VIS-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }

  /**
   * Carrega histórico em cache local para resposta instantânea
   */
  private loadCachedVisits(): void {
    try {
      const raw = localStorage.getItem(this.VISITS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SiteVisit[];
        if (Array.isArray(parsed)) {
          this.visits.set(parsed);
        }
      }
    } catch (e) {
      console.warn('Erro ao ler cache de visitas:', e);
    }
  }

  /**
   * Sincronização em tempo real com o Firestore (coleção 'visitas_site')
   */
  private initRealtimeSync(): void {
    this.firebaseService.listenToCollection('visitas_site', (cloudVisits) => {
      if (cloudVisits !== null && Array.isArray(cloudVisits)) {
        // Ordena por data decrescente (mais recente primeiro)
        const sorted = (cloudVisits as SiteVisit[]).sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        this.visits.set(sorted);
        try {
          // Salva os 200 mais recentes no localStorage para cache rápido
          localStorage.setItem(this.VISITS_STORAGE_KEY, JSON.stringify(sorted.slice(0, 200)));
        } catch {
          // se exceder cota do storage local, ignora
        }
      }
    });
  }

  /**
   * Monitora a navegação no Angular e registra acessos
   */
  private startTracking(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.trackPageView(event.urlAfterRedirects || event.url);
    });
  }

  /**
   * Registra a visualização de página com proteções anti-spam
   */
  public trackPageView(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0] || '/';
    const now = Date.now();

    // Evita duplicar cliques repetidos na mesma página em menos de 10 segundos
    if (cleanUrl === this.lastTrackedUrl && (now - this.lastTrackedTime) < 10000) {
      return;
    }

    this.lastTrackedUrl = cleanUrl;
    this.lastTrackedTime = now;

    const vId = this.visitorId() || 'VIS-999999';
    const isReturning = this.checkIfReturningVisitor();
    const deviceInfo = this.detectDevice();

    const visit: SiteVisit = {
      id: `vis_${now}_${Math.random().toString(36).substring(2, 6)}`,
      visitorId: vId,
      timestamp: new Date(now).toISOString(),
      date: new Date(now).toISOString().slice(0, 10), // YYYY-MM-DD
      page: cleanUrl,
      pageTitle: this.getPageTitle(cleanUrl),
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      city: 'Macaé / RJ', // Base da ONG
      referrer: this.detectReferrer(),
      isReturning: isReturning
    };

    // Atualiza estado local imediatamente
    const current = [visit, ...this.visits()];
    this.visits.set(current);

    try {
      localStorage.setItem(this.VISITS_STORAGE_KEY, JSON.stringify(current.slice(0, 200)));
      localStorage.setItem(this.LAST_VISIT_KEY, now.toString());
    } catch {
      // no-op
    }

    // Grava de forma assíncrona no Firestore
    this.firebaseService.saveDocument('visitas_site', visit.id, visit);
  }

  private checkIfReturningVisitor(): boolean {
    try {
      const firstSeen = localStorage.getItem(this.VISITOR_FIRST_SEEN_KEY);
      if (!firstSeen) return false;
      const firstSeenTime = new Date(firstSeen).getTime();
      return (Date.now() - firstSeenTime) > 30000; // mais de 30 segundos da primeira visualização
    } catch {
      return false;
    }
  }

  private detectDevice(): { device: 'mobile' | 'desktop' | 'tablet'; browser: string; os: string } {
    if (typeof window === 'undefined' || !window.navigator) {
      return { device: 'desktop', browser: 'Desconhecido', os: 'Desconhecido' };
    }

    const ua = window.navigator.userAgent || '';
    let device: 'mobile' | 'desktop' | 'tablet' = 'desktop';

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      device = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      device = 'mobile';
    }

    // Detectar Navegador
    let browser = 'Chrome';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome') && !ua.includes('Edg/')) browser = 'Google Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('Brave')) browser = 'Brave';
    else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

    // Detectar Sistema Operacional
    let os = 'Windows';
    if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS (iPhone/iPad)';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Linux')) os = 'Linux';

    return { device, browser, os };
  }

  private detectReferrer(): string {
    if (typeof document === 'undefined' || !document.referrer) {
      return 'Acesso Direto';
    }
    const ref = document.referrer.toLowerCase();
    if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'WhatsApp';
    if (ref.includes('instagram')) return 'Instagram';
    if (ref.includes('facebook')) return 'Facebook';
    if (ref.includes('google')) return 'Google';
    if (ref.includes('tiktok')) return 'TikTok';
    return 'Outro Site';
  }

  private getPageTitle(url: string): string {
    switch (url) {
      case '/':
      case '':
        return 'Página Inicial (Home)';
      case '/cadastro':
        return 'Inscrições para Cursos & Vagas';
      case '/cursos':
        return 'Cursos Profissionalizantes';
      case '/quem-somos':
        return 'Quem Somos & Transparência';
      case '/pets':
        return 'Adoção & Cuidados Pet';
      case '/contato':
        return 'Contato & Localização';
      case '/admin':
        return 'Painel Administrativo';
      default:
        return url;
    }
  }

  // ================= COMPUTED SIGNALS (MÉTRICAS POR PERÍODO) =================

  /**
   * Resumo completo de contagem: Hoje, Semana, Mês, Ano e Total
   */
  summary = computed<AnalyticsSummary>(() => {
    const list = this.visits();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
    const currentYearStr = now.getFullYear().toString(); // YYYY

    // 7 dias atrás
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayVisits: SiteVisit[] = [];
    const weekVisits: SiteVisit[] = [];
    const monthVisits: SiteVisit[] = [];
    const yearVisits: SiteVisit[] = [];

    list.forEach(v => {
      const vDate = new Date(v.timestamp);
      // Hoje
      if (v.date === todayStr) {
        todayVisits.push(v);
      }
      // Últimos 7 dias (Semana)
      if (vDate >= sevenDaysAgo && vDate <= now) {
        weekVisits.push(v);
      }
      // Este Mês
      if (v.date.startsWith(currentMonthStr)) {
        monthVisits.push(v);
      }
      // Este Ano
      if (v.date.startsWith(currentYearStr)) {
        yearVisits.push(v);
      }
    });

    return {
      todayTotal: todayVisits.length,
      todayUnique: new Set(todayVisits.map(v => v.visitorId)).size,
      weekTotal: weekVisits.length,
      weekUnique: new Set(weekVisits.map(v => v.visitorId)).size,
      monthTotal: monthVisits.length,
      monthUnique: new Set(monthVisits.map(v => v.visitorId)).size,
      yearTotal: yearVisits.length,
      yearUnique: new Set(yearVisits.map(v => v.visitorId)).size,
      allTimeTotal: list.length,
      allTimeUnique: new Set(list.map(v => v.visitorId)).size
    };
  });

  /**
   * Páginas mais acessadas com contagem e porcentagem
   */
  topPages = computed(() => {
    const list = this.visits();
    const total = list.length || 1;
    const pageCounts: { [key: string]: { count: number; title: string } } = {};

    list.forEach(v => {
      if (!pageCounts[v.page]) {
        pageCounts[v.page] = { count: 0, title: v.pageTitle };
      }
      pageCounts[v.page].count++;
    });

    return Object.entries(pageCounts)
      .map(([page, data]) => ({
        page,
        title: data.title,
        count: data.count,
        percentage: Math.round((data.count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  });

  /**
   * Distribuição por tipo de aparelho (Celular, Computador, Tablet)
   */
  deviceStats = computed(() => {
    const list = this.visits();
    const total = list.length || 1;
    let mobile = 0;
    let desktop = 0;
    let tablet = 0;

    list.forEach(v => {
      if (v.device === 'mobile') mobile++;
      else if (v.device === 'tablet') tablet++;
      else desktop++;
    });

    return {
      mobile,
      desktop,
      tablet,
      mobilePercent: Math.round((mobile / total) * 100),
      desktopPercent: Math.round((desktop / total) * 100),
      tabletPercent: Math.round((tablet / total) * 100)
    };
  });

  /**
   * Gráfico de acessos dos últimos 7 dias
   */
  dailyChart = computed(() => {
    const list = this.visits();
    const days: { dateStr: string; label: string; count: number; uniqueCount: number }[] = [];
    const now = new Date();

    const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const label = `${weekdayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;

      const dayVisits = list.filter(v => v.date === dateStr);
      const uniqueCount = new Set(dayVisits.map(v => v.visitorId)).size;

      days.push({
        dateStr,
        label,
        count: dayVisits.length,
        uniqueCount
      });
    }

    return days;
  });

  /**
   * Exporta os registros de acessos para planilha Excel (.csv) com acentuação correta UTF-8
   */
  exportToCsv(filteredVisits?: SiteVisit[]): void {
    const list = filteredVisits || this.visits();
    if (list.length === 0) {
      alert('Nenhum dado de acesso para exportar no momento.');
      return;
    }

    const headers = [
      'ID do Visitante',
      'Data e Hora',
      'Data (AAAA-MM-DD)',
      'Página Acessada',
      'Título da Página',
      'Dispositivo',
      'Sistema Operacional',
      'Navegador',
      'Origem',
      'Tipo de Visitante'
    ];

    const rows = list.map(v => [
      v.visitorId,
      new Date(v.timestamp).toLocaleString('pt-BR'),
      v.date,
      `"${v.page}"`,
      `"${v.pageTitle.replace(/"/g, '""')}"`,
      v.device === 'mobile' ? 'Celular' : (v.device === 'tablet' ? 'Tablet' : 'Computador'),
      `"${v.os}"`,
      `"${v.browser}"`,
      `"${v.referrer || 'Direto'}"`,
      v.isReturning ? 'Recorrente' : 'Novo Visitante'
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_acessos_ong_maos_que_cuidam_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
