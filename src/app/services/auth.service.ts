import { Injectable, signal, computed, inject } from '@angular/core';
import { AdminUser, AdminRole, AccessLogEntry } from '../models/registration.model';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseService = inject(FirebaseService);
  private notificationService = inject(NotificationService);
  private readonly STAFF_STORAGE_KEY = 'mqc_staff_users';
  private readonly CURRENT_USER_KEY = 'mqc_active_admin_session';
  private readonly ACCESS_LOGS_KEY = 'mqc_access_logs';

  // Signals
  private staffUsersSignal = signal<AdminUser[]>([]);
  private currentUserSignal = signal<AdminUser | null>(null);
  private accessLogsSignal = signal<AccessLogEntry[]>([]);

  // Computed
  readonly staffList = computed(() => this.staffUsersSignal());
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly accessLogs = computed(() => this.accessLogsSignal());
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isOwner = computed(() => this.currentUserSignal()?.isOwner === true);

  constructor() {
    this.loadStaffFromStorage();
    this.loadLogsFromStorage();
    this.restoreSession();
  }

  /**
   * Realiza login no painel administrativo e emite alerta de segurança
   */
  login(email: string, pass: string): { success: boolean; message: string; alertLink?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.staffUsersSignal().find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'Usuário não encontrado. Verifique o e-mail informado.' };
    }

    if (!user.active) {
      return { success: false, message: 'Este usuário está desativado pela Diretoria da ONG.' };
    }

    if (user.password !== pass) {
      return { success: false, message: 'Senha incorreta. Tente novamente.' };
    }

    const updatedUser: AdminUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };

    this.currentUserSignal.set(updatedUser);
    this.saveSession(updatedUser);

    // Registra entrada de auditoria
    const logEntry: AccessLogEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      isOwner: user.isOwner,
      accessedAt: new Date().toISOString(),
      deviceInfo: 'Sessão Web Segura • Macaé/RJ'
    };
    const updatedLogs = [logEntry, ...this.accessLogsSignal()];
    this.accessLogsSignal.set(updatedLogs);
    this.saveLogs(updatedLogs);

    // Registra no histórico de acessos (Firestore Cloud)
    this.firebaseService.saveDocument('historico_acessos', logEntry.id, logEntry);

    // Envia e-mail de alerta de segurança
    this.notificationService.sendEmail('template_alerta_login', {
      userName: user.name,
      email: user.email,
      role: user.role,
      accessedAt: new Date().toLocaleString('pt-BR')
    });

    const alertLink = this.notificationService.getLoginAlertWhatsappLink(user);
    return { 
      success: true, 
      message: `Bem-vindo(a), ${user.name}!`,
      alertLink 
    };
  }

  /**
   * Encerra a sessão atual
   */
  logout(): void {
    this.currentUserSignal.set(null);
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Cadastra novo funcionário / colaborador interno (SOMENTE O DONO PODE)
   */
  addStaff(data: { name: string; email: string; password: string; role: AdminRole; phone: string; isOwner?: boolean }): { success: boolean; message: string; user?: AdminUser } {
    if (!this.isOwner()) {
      return { success: false, message: 'Apenas a Diretoria / Dono tem permissão para cadastrar novos funcionários.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const exists = this.staffUsersSignal().some(u => u.email.toLowerCase() === cleanEmail);

    if (exists) {
      return { success: false, message: 'Já existe um funcionário cadastrado com este e-mail.' };
    }

    const newUser: AdminUser = {
      id: 'staff_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password.trim(),
      role: data.role,
      isOwner: data.isOwner || false,
      phone: data.phone.trim(),
      active: true,
      createdAt: new Date().toISOString()
    };

    const updatedList = [...this.staffUsersSignal(), newUser];
    this.staffUsersSignal.set(updatedList);
    this.saveStaffToStorage(updatedList);

    // Sincroniza com Firebase Cloud
    this.firebaseService.saveDocument('equipe_interna', newUser.id, {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isOwner: newUser.isOwner,
      phone: newUser.phone,
      active: newUser.active,
      createdAt: newUser.createdAt
    });

    return { success: true, message: `Colaborador "${newUser.name}" cadastrado com sucesso!`, user: newUser };
  }

  /**
   * Atualiza dados de um funcionário (Nome, Cargo, Telefone, Status) - SOMENTE DONO ou o próprio usuário
   */
  updateStaff(id: string, updates: Partial<Pick<AdminUser, 'name' | 'role' | 'phone' | 'active' | 'isOwner'>>): { success: boolean; message: string } {
    const current = this.currentUserSignal();
    if (!current) return { success: false, message: 'Você precisa estar logado.' };

    const isTargetingSelf = current.id === id;
    if (!this.isOwner() && !isTargetingSelf) {
      return { success: false, message: 'Apenas o Dono pode alterar dados de outros funcionários.' };
    }

    const updatedList = this.staffUsersSignal().map(u => {
      if (u.id === id) {
        return {
          ...u,
          ...updates,
          // Não permite que o dono principal retire o próprio poder de dono
          isOwner: u.email === 'admin@maosquecuidam.org.br' ? true : (updates.isOwner !== undefined ? updates.isOwner : u.isOwner)
        };
      }
      return u;
    });

    this.staffUsersSignal.set(updatedList);
    this.saveStaffToStorage(updatedList);

    // Se estiver alterando o próprio perfil ativo
    if (isTargetingSelf) {
      const refreshed = updatedList.find(u => u.id === id);
      if (refreshed) {
        this.currentUserSignal.set(refreshed);
        this.saveSession(refreshed);
      }
    }

    return { success: true, message: 'Dados atualizados com sucesso!' };
  }

  /**
   * Altera a senha de um funcionário
   * (O Dono pode alterar a senha de qualquer um; funcionários só alteram a própria senha com a senha antiga)
   */
  changePassword(targetUserId: string, newPassword: string, oldPassword?: string): { success: boolean; message: string } {
    const current = this.currentUserSignal();
    if (!current) return { success: false, message: 'Sessão inválida.' };

    const isSelf = current.id === targetUserId;
    const isOwner = this.isOwner();

    if (!isOwner && !isSelf) {
      return { success: false, message: 'Permissão negada. Apenas o Dono pode redefinir senhas de terceiros.' };
    }

    const targetUser = this.staffUsersSignal().find(u => u.id === targetUserId);
    if (!targetUser) return { success: false, message: 'Funcionário não encontrado.' };

    // Se for o próprio funcionário alterando a sua senha, exige a senha antiga
    if (isSelf && !isOwner) {
      if (!oldPassword || targetUser.password !== oldPassword) {
        return { success: false, message: 'A senha antiga informada está incorreta.' };
      }
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'A nova senha deve ter no mínimo 4 caracteres.' };
    }

    const updatedList = this.staffUsersSignal().map(u => {
      if (u.id === targetUserId) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    this.staffUsersSignal.set(updatedList);
    this.saveStaffToStorage(updatedList);

    if (isSelf) {
      const refreshed = updatedList.find(u => u.id === targetUserId);
      if (refreshed) {
        this.currentUserSignal.set(refreshed);
        this.saveSession(refreshed);
      }
    }

    return { success: true, message: `Senha de "${targetUser.name}" alterada com sucesso!` };
  }

  /**
   * Remove um funcionário (Apenas Dono pode, e não pode remover a si mesmo)
   */
  deleteStaff(id: string): { success: boolean; message: string } {
    if (!this.isOwner()) {
      return { success: false, message: 'Apenas a Diretoria / Dono pode remover colaboradores.' };
    }

    const current = this.currentUserSignal();
    if (current && current.id === id) {
      return { success: false, message: 'Você não pode excluir a sua própria conta de Dono / Master.' };
    }

    const updatedList = this.staffUsersSignal().filter(u => u.id !== id);
    this.staffUsersSignal.set(updatedList);
    this.saveStaffToStorage(updatedList);
    return { success: true, message: 'Colaborador removido da equipe com sucesso.' };
  }

  // --- PERSISTÊNCIA ---
  private loadStaffFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STAFF_STORAGE_KEY);
      if (stored) {
        this.staffUsersSignal.set(JSON.parse(stored));
      } else {
        const seed = this.getSeedStaff();
        this.staffUsersSignal.set(seed);
        this.saveStaffToStorage(seed);
      }
    } catch (e) {
      console.warn('Erro ao carregar equipe do storage:', e);
      const seed = this.getSeedStaff();
      this.staffUsersSignal.set(seed);
    }
  }

  private saveStaffToStorage(data: AdminUser[]): void {
    try {
      localStorage.setItem(this.STAFF_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }

  private restoreSession(): void {
    try {
      const active = localStorage.getItem(this.CURRENT_USER_KEY);
      if (active) {
        const parsed = JSON.parse(active);
        // Confirma se o usuário ainda existe e está ativo
        const exists = this.staffUsersSignal().find(u => u.id === parsed.id && u.active);
        if (exists) {
          this.currentUserSignal.set(exists);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  private saveSession(user: AdminUser): void {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }

  private loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.ACCESS_LOGS_KEY);
      if (stored) {
        this.accessLogsSignal.set(JSON.parse(stored));
      } else {
        const seed = this.getSeedLogs();
        this.accessLogsSignal.set(seed);
        this.saveLogs(seed);
      }
    } catch (e) {
      console.error(e);
      this.accessLogsSignal.set(this.getSeedLogs());
    }
  }

  private saveLogs(logs: AccessLogEntry[]): void {
    try {
      localStorage.setItem(this.ACCESS_LOGS_KEY, JSON.stringify(logs.slice(0, 100))); // Guarda últimos 100 acessos
    } catch (e) {
      console.error(e);
    }
  }

  private getSeedLogs(): AccessLogEntry[] {
    return [
      {
        id: 'log_seed_1',
        userId: 'staff_master_1',
        userName: 'Diretoria Geral (Dono)',
        userEmail: 'admin@maosquecuidam.org.br',
        role: 'Dono / Administrador Master',
        isOwner: true,
        accessedAt: new Date(Date.now() - 3600000).toISOString(),
        deviceInfo: 'Sessão Web Segura • Macaé/RJ'
      },
      {
        id: 'log_seed_2',
        userId: 'staff_coord_2',
        userName: 'Coordenadora Pedagógica',
        userEmail: 'coordenacao@maosquecuidam.org.br',
        role: 'Coordenador Pedagógico',
        isOwner: false,
        accessedAt: new Date(Date.now() - 86400000).toISOString(),
        deviceInfo: 'Sessão Web Segura • Macaé/RJ'
      }
    ];
  }

  /**
   * Usuários iniciais do sistema
   */
  private getSeedStaff(): AdminUser[] {
    return [
      {
        id: 'staff_master_1',
        name: 'Diretoria Geral (Dono)',
        email: 'admin@maosquecuidam.org.br',
        password: 'admin',
        role: 'Dono / Administrador Master',
        isOwner: true,
        phone: '(22) 99848-1112',
        active: true,
        createdAt: '2026-08-01T08:00:00.000Z'
      },
      {
        id: 'staff_coord_2',
        name: 'Coordenadora Pedagógica',
        email: 'coordenacao@maosquecuidam.org.br',
        password: 'aluno',
        role: 'Coordenador Pedagógico',
        isOwner: false,
        phone: '(22) 99848-1112',
        active: true,
        createdAt: '2026-08-10T09:00:00.000Z'
      },
      {
        id: 'staff_instrutor_3',
        name: 'Prof. Carlos Eduardo',
        email: 'carlos.groomer@maosquecuidam.org.br',
        password: 'tosa',
        role: 'Instrutor de Banho e Tosa',
        isOwner: false,
        phone: '(22) 99848-1112',
        active: true,
        createdAt: '2026-08-15T14:00:00.000Z'
      }
    ];
  }
}
