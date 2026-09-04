import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { 
  StudentRegistration, 
  VolunteerRegistration, 
  PetRegistration, 
  RegistrationStatus,
  AdminUser,
  AdminRole,
  Course,
  VideoAd
} from '../../models/registration.model';

export interface RankedStudent extends StudentRegistration {
  queuePosition: number; // Posição geral por ordem de chegada
  coursePosition: number; // Posição na fila do curso específico
  isTitular: boolean; // Se está dentro do limite de vagas titulares (ex: até 15)
  waitingListNumber?: number; // Posição na lista de espera se exceder 15
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  registrationService = inject(RegistrationService);
  authService = inject(AuthService);

  courses: Course[] = this.registrationService.getCourses();
  readonly VAGAS_TITULARES_LIMITE = 15; // 15 vagas titulares por turma

  // Estados de Login
  loginEmail = signal<string>('admin@maosquecuidam.org.br');
  loginPassword = signal<string>('admin');
  loginError = signal<string | null>(null);

  // Visualização ativa
  activeView = signal<'students' | 'volunteers' | 'pets' | 'videoAds' | 'staff' | 'logs'>('students');
  searchQuery = signal<string>('');
  statusFilter = signal<string>('all');
  courseFilter = signal<string>('all');
  shiftFilter = signal<string>('all');

  // Modais de Edição de Propagandas de Vídeo das Abas Laterais
  showEditVideoAdModal = signal<boolean>(false);
  editingVideoAdId = signal<string>('');
  editAdTitle = signal<string>('');
  editAdSponsor = signal<string>('');
  editAdVideoUrl = signal<string>('');
  editAdPosterUrl = signal<string>('');
  editAdClickUrl = signal<string>('');
  editAdBadge = signal<string>('');
  editAdDesc = signal<string>('');
  editAdActive = signal<boolean>(true);
  editAdPosition = signal<'left' | 'right'>('left');

  // Modais de detalhes dos cadastros
  selectedStudent = signal<StudentRegistration | null>(null);
  selectedVolunteer = signal<VolunteerRegistration | null>(null);
  selectedPet = signal<PetRegistration | null>(null);

  // Modal de Certificado Digital Oficial de Conclusão
  showCertificateModal = signal<boolean>(false);
  certificateStudent = signal<StudentRegistration | null>(null);
  certificateCode = signal<string>('');

  // Modo de visualização de Pets (Tabela vs Agenda Semanal)
  petViewMode = signal<'table' | 'schedule'>('table');
  weekDays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Modais de Gestão de Funcionários & Senha
  showNewStaffModal = signal<boolean>(false);
  newStaffName = signal<string>('');
  newStaffEmail = signal<string>('');
  newStaffPassword = signal<string>('');
  newStaffRole = signal<AdminRole>('Instrutor de Banho e Tosa');
  newStaffPhone = signal<string>('(22) 99848-1112');
  newStaffIsOwner = signal<boolean>(false);

  showEditStaffModal = signal<boolean>(false);
  editingStaffId = signal<string>('');
  editStaffName = signal<string>('');
  editStaffRole = signal<AdminRole>('Instrutor de Banho e Tosa');
  editStaffPhone = signal<string>('');
  editStaffActive = signal<boolean>(true);
  editStaffIsOwner = signal<boolean>(false);

  showPasswordModal = signal<boolean>(false);
  passwordTargetUserId = signal<string>('');
  passwordTargetUserName = signal<string>('');
  passwordOld = signal<string>('');
  passwordNew = signal<string>('');
  passwordConfirm = signal<string>('');

  // Notificação toast
  toastMessage = signal<string | null>(null);

  // 🎓 FILA PRIORITÁRIA DE ALUNOS ORDENADA POR ORDEM CRONOLÓGICA DE CHEGADA
  rankedStudents = computed<RankedStudent[]>(() => {
    // 1. Ordena todos os alunos por data e hora de inscrição (o primeiro cadastrado fica no topo)
    const sorted = [...this.registrationService.students()].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // 2. Mapeia posições por curso e geral
    const courseCounters: { [courseId: string]: number } = {};

    const ranked: RankedStudent[] = sorted.map((std, index) => {
      const cId = std.courseId || 'geral';
      courseCounters[cId] = (courseCounters[cId] || 0) + 1;
      const cPos = courseCounters[cId];
      const isTitular = cPos <= this.VAGAS_TITULARES_LIMITE;

      return {
        ...std,
        queuePosition: index + 1,
        coursePosition: cPos,
        isTitular: isTitular,
        waitingListNumber: isTitular ? undefined : (cPos - this.VAGAS_TITULARES_LIMITE)
      };
    });

    // 3. Aplica filtros de pesquisa, status, curso e turno
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.statusFilter();
    const cFilter = this.courseFilter();
    const sFilter = this.shiftFilter();

    return ranked.filter(s => {
      const matchesQuery = !q || s.fullName.toLowerCase().includes(q) || s.protocol.toLowerCase().includes(q) || s.cpf.includes(q) || s.courseName.toLowerCase().includes(q);
      const matchesStatus = st === 'all' || s.status === st;
      const matchesCourse = cFilter === 'all' || s.courseId === cFilter;
      const matchesShift = sFilter === 'all' || s.preferredShift.toLowerCase().includes(sFilter.toLowerCase());
      return matchesQuery && matchesStatus && matchesCourse && matchesShift;
    });
  });

  // Estatísticas da fila de alunos
  titularStudentsCount = computed(() => {
    return this.rankedStudents().filter(s => s.isTitular).length;
  });

  waitingListStudentsCount = computed(() => {
    return this.rankedStudents().filter(s => !s.isTitular).length;
  });

  filteredVolunteers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.statusFilter();
    return this.registrationService.volunteers().filter(v => {
      const matchesQuery = !q || v.fullName.toLowerCase().includes(q) || v.protocol.toLowerCase().includes(q) || v.areaOfInterest.toLowerCase().includes(q);
      const matchesStatus = st === 'all' || v.status === st;
      return matchesQuery && matchesStatus;
    });
  });

  filteredPets = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.statusFilter();
    return this.registrationService.pets().filter(p => {
      const matchesQuery = !q || p.petName.toLowerCase().includes(q) || p.tutorName.toLowerCase().includes(q) || p.protocol.toLowerCase().includes(q) || p.petBreed.toLowerCase().includes(q);
      const matchesStatus = st === 'all' || p.status === st;
      return matchesQuery && matchesStatus;
    });
  });

  filteredStaff = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.authService.staffList().filter(u => {
      return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
    });
  });

  // --- MÉTODOS DE LOGIN / LOGOUT ---
  onLogin(): void {
    this.loginError.set(null);
    const res = this.authService.login(this.loginEmail(), this.loginPassword());
    if (res.success) {
      this.showToast(`🔐 ${res.message} Alerta de acesso registrado para a Diretoria via WhatsApp.`);
      if (res.alertLink) {
        window.open(res.alertLink, '_blank');
      }
    } else {
      this.loginError.set(res.message);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.showToast('Sessão encerrada com sucesso.');
  }

  setView(view: 'students' | 'volunteers' | 'pets' | 'videoAds' | 'staff' | 'logs'): void {
    this.activeView.set(view);
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.courseFilter.set('all');
    this.shiftFilter.set('all');
  }

  getWhatsappLink(phone: string, name: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const num = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = `Olá, ${name}! Sou da coordenação da ONG Mãos que Cuidam. Entramos em contato referente ao seu cadastro em nosso sistema.`;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Dispara convocação oficial do aluno por ordem prioritária da fila
   */
  getConvocationWhatsappLink(student: RankedStudent): string {
    const cleanPhone = student.phone.replace(/\D/g, '');
    const num = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const text = `🎓 *CONVOCAÇÃO DE MATRÍCULA - VAGA SOCIAL LIBERADA!* 🐾\n` +
      `*ONG Mãos que Cuidam - Macaé/RJ*\n\n` +
      `Olá, *${student.fullName}*! 🎉\n\n` +
      `Temos uma excelente notícia! Pela ordem cronológica de inscrição (Você é o *#${student.coursePosition}º Lugar* na fila do curso), a sua vaga titular foi liberada:\n\n` +
      `📚 *Curso:* ${student.courseName}\n` +
      `⏰ *Turno:* ${student.preferredShift}\n` +
      `📋 *Protocolo:* ${student.protocol}\n` +
      `📍 *Local das Aulas:* Rua Raymundo Peixoto Lins, nº 48, Barra - Macaé/RJ\n\n` +
      `Por favor, responda a esta mensagem confirmando o seu interesse para garantirmos a sua bancada de treinamento e o seu uniforme!\n\n` +
      `_Coordenação Pedagógica - ONG Mãos que Cuidam_`;

    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  }

  updateStudentStatus(id: string, newStatus: RegistrationStatus): void {
    this.registrationService.updateStudentStatus(id, newStatus);
    this.showToast(`Status do aluno atualizado para "${newStatus}".`);
  }

  deleteStudent(id: string, name: string): void {
    if (confirm(`Deseja realmente remover a inscrição de "${name}"?`)) {
      this.registrationService.deleteStudent(id);
      this.showToast(`Inscrição de "${name}" removida com sucesso.`);
    }
  }

  updateVolunteerStatus(id: string, newStatus: RegistrationStatus): void {
    this.registrationService.updateVolunteerStatus(id, newStatus);
    this.showToast(`Status do voluntário atualizado para "${newStatus}".`);
  }

  deleteVolunteer(id: string, name: string): void {
    if (confirm(`Deseja realmente remover o cadastro de "${name}"?`)) {
      this.registrationService.deleteVolunteer(id);
      this.showToast(`Voluntário "${name}" removido.`);
    }
  }

  updatePetStatus(id: string, newStatus: RegistrationStatus): void {
    this.registrationService.updatePetStatus(id, newStatus);
    this.showToast(`Status do pet atualizado para "${newStatus}".`);
  }

  deletePet(id: string, name: string): void {
    if (confirm(`Deseja realmente remover o pet "${name}" da lista?`)) {
      this.registrationService.deletePet(id);
      this.showToast(`Pet "${name}" removido.`);
    }
  }

  // ================= EXPORTAÇÃO & RELATÓRIOS EXCEL / IMPRESSÃO =================
  exportStudentsToExcel(): void {
    const list: RankedStudent[] = this.rankedStudents();
    if (list.length === 0) {
      alert('Nenhum aluno encontrado para exportar.');
      return;
    }

    const headers = ['Posição Geral', 'Posição Turma', 'Tipo Vaga', 'Protocolo', 'Nome Completo', 'CPF', 'Curso', 'Turno', 'WhatsApp', 'E-mail', 'Cidade', 'Bairro', 'Situação Profissional', 'Status', 'Data Inscrição'];
    const rows = list.map((s: RankedStudent) => [
      s.queuePosition,
      s.coursePosition,
      s.isTitular ? 'Titular' : `Lista de Espera (#${s.waitingListNumber})`,
      s.protocol,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.cpf}"`,
      `"${s.courseName.replace(/"/g, '""')}"`,
      s.preferredShift,
      `"${s.phone}"`,
      `"${s.email}"`,
      `"${s.city}"`,
      `"${s.neighborhood}"`,
      `"${s.employmentStatus}"`,
      s.status,
      new Date(s.createdAt).toLocaleString('pt-BR')
    ]);

    this.downloadCsv('relatorio_alunos_maos_que_cuidam.csv', [headers, ...rows]);
    this.showToast('📊 Relatório de alunos exportado em Excel (.csv) com sucesso!');
  }

  exportVolunteersToExcel(): void {
    const list: VolunteerRegistration[] = this.filteredVolunteers();
    if (list.length === 0) {
      alert('Nenhum voluntário encontrado para exportar.');
      return;
    }

    const headers = ['Protocolo', 'Nome Completo', 'Profissão / Ocupação', 'Área de Interesse', 'Disponibilidade', 'WhatsApp', 'E-mail', 'Status', 'Data Inscrição'];
    const rows = list.map((v: VolunteerRegistration) => [
      v.protocol,
      `"${v.fullName.replace(/"/g, '""')}"`,
      `"${v.occupation.replace(/"/g, '""')}"`,
      `"${v.areaOfInterest}"`,
      `"${v.availability}"`,
      `"${v.phone}"`,
      `"${v.email}"`,
      v.status,
      new Date(v.createdAt).toLocaleString('pt-BR')
    ]);

    this.downloadCsv('relatorio_voluntarios_maos_que_cuidam.csv', [headers, ...rows]);
    this.showToast('📊 Relatório de voluntários exportado em Excel (.csv) com sucesso!');
  }

  exportPetsToExcel(): void {
    const list: PetRegistration[] = this.filteredPets();
    if (list.length === 0) {
      alert('Nenhum pet encontrado para exportar.');
      return;
    }

    const headers = ['Protocolo', 'Nome do Pet', 'Espécie', 'Raça', 'Porte', 'Observações / Cuidados', 'Dia Preferido', 'Nome do Tutor', 'WhatsApp Tutor', 'CPF Tutor', 'Status', 'Data Agendamento'];
    const rows = list.map((p: PetRegistration) => [
      p.protocol,
      `"${p.petName.replace(/"/g, '""')}"`,
      p.petSpecies,
      `"${p.petBreed}"`,
      p.petSize,
      `"${(p.specialCareNotes || 'Banho & Higienização').replace(/"/g, '""')}"`,
      p.preferredDay,
      `"${p.tutorName.replace(/"/g, '""')}"`,
      `"${p.tutorPhone}"`,
      `"${p.tutorCpf}"`,
      p.status,
      new Date(p.createdAt).toLocaleString('pt-BR')
    ]);

    this.downloadCsv('relatorio_banhos_pet_maos_que_cuidam.csv', [headers, ...rows]);
    this.showToast('📊 Relatório de banhos sociais exportado em Excel (.csv) com sucesso!');
  }

  private downloadCsv(filename: string, data: (string | number)[][]): void {
    const csvContent = '\uFEFF' + data.map(row => row.join(';')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Visualização e Impressão de Lista de Chamada
  showAttendanceModal = signal<boolean>(false);
  attendanceType = signal<'students' | 'pets'>('students');

  openAttendanceModal(type: 'students' | 'pets'): void {
    this.attendanceType.set(type);
    this.showAttendanceModal.set(true);
  }

  printAttendanceSheet(): void {
    window.print();
  }

  // ================= 🎬 GESTÃO DE PROPAGANDAS DE VÍDEO DAS ABAS LATERAIS =================
  openEditVideoAdModal(ad: VideoAd): void {
    this.editingVideoAdId.set(ad.id);
    this.editAdPosition.set(ad.position);
    this.editAdTitle.set(ad.title);
    this.editAdSponsor.set(ad.sponsorName);
    this.editAdVideoUrl.set(ad.videoUrl);
    this.editAdPosterUrl.set(ad.posterUrl || '');
    this.editAdClickUrl.set(ad.clickUrl);
    this.editAdBadge.set(ad.badgeText);
    this.editAdDesc.set(ad.description || '');
    this.editAdActive.set(ad.active);
    this.showEditVideoAdModal.set(true);
  }

  saveEditedVideoAd(): void {
    if (!this.editAdTitle() || !this.editAdSponsor() || !this.editAdVideoUrl()) {
      alert('Por favor, preencha o Título, Nome do Patrocinador e a URL do Vídeo.');
      return;
    }

    this.registrationService.updateVideoAd(this.editingVideoAdId(), {
      title: this.editAdTitle(),
      sponsorName: this.editAdSponsor(),
      videoUrl: this.editAdVideoUrl(),
      posterUrl: this.editAdPosterUrl(),
      clickUrl: this.editAdClickUrl(),
      badgeText: this.editAdBadge(),
      description: this.editAdDesc(),
      active: this.editAdActive()
    });

    this.showEditVideoAdModal.set(false);
    this.showToast(`🎬 Propaganda de vídeo "${this.editAdSponsor()}" atualizada com sucesso!`);
  }

  toggleVideoAdActive(ad: VideoAd): void {
    this.registrationService.updateVideoAd(ad.id, { active: !ad.active });
    this.showToast(`Status da propaganda de ${ad.sponsorName} alterado para ${!ad.active ? 'Ativo' : 'Pausado'}.`);
  }

  // --- GESTÃO DE FUNCIONÁRIOS (RESTRITO AO DONO) ---
  openNewStaffModal(): void {
    if (!this.authService.isOwner()) {
      alert('Apenas a Diretoria / Dono tem permissão para cadastrar funcionários.');
      return;
    }
    this.newStaffName.set('');
    this.newStaffEmail.set('');
    this.newStaffPassword.set('');
    this.newStaffRole.set('Instrutor de Banho e Tosa');
    this.newStaffPhone.set('(22) 99848-1112');
    this.newStaffIsOwner.set(false);
    this.showNewStaffModal.set(true);
  }

  saveNewStaff(): void {
    if (!this.newStaffName() || !this.newStaffEmail() || !this.newStaffPassword()) {
      alert('Por favor, preencha nome, e-mail e senha provisória.');
      return;
    }

    const res = this.authService.addStaff({
      name: this.newStaffName(),
      email: this.newStaffEmail(),
      password: this.newStaffPassword(),
      role: this.newStaffRole(),
      phone: this.newStaffPhone(),
      isOwner: this.newStaffIsOwner()
    });

    if (res.success) {
      this.showNewStaffModal.set(false);
      this.showToast(res.message);
    } else {
      alert(res.message);
    }
  }

  openEditStaffModal(user: AdminUser): void {
    if (!this.authService.isOwner() && this.authService.currentUser()?.id !== user.id) {
      alert('Apenas o Dono pode editar dados de outros funcionários.');
      return;
    }
    this.editingStaffId.set(user.id);
    this.editStaffName.set(user.name);
    this.editStaffRole.set(user.role);
    this.editStaffPhone.set(user.phone);
    this.editStaffActive.set(user.active);
    this.editStaffIsOwner.set(user.isOwner);
    this.showEditStaffModal.set(true);
  }

  saveEditStaff(): void {
    const res = this.authService.updateStaff(this.editingStaffId(), {
      name: this.editStaffName(),
      role: this.editStaffRole(),
      phone: this.editStaffPhone(),
      active: this.editStaffActive(),
      isOwner: this.editStaffIsOwner()
    });

    if (res.success) {
      this.showEditStaffModal.set(false);
      this.showToast(res.message);
    } else {
      alert(res.message);
    }
  }

  openPasswordModal(user: AdminUser): void {
    const isOwner = this.authService.isOwner();
    const isSelf = this.authService.currentUser()?.id === user.id;

    if (!isOwner && !isSelf) {
      alert('Apenas o Dono pode alterar a senha de outros funcionários.');
      return;
    }

    this.passwordTargetUserId.set(user.id);
    this.passwordTargetUserName.set(user.name);
    this.passwordOld.set('');
    this.passwordNew.set('');
    this.passwordConfirm.set('');
    this.showPasswordModal.set(true);
  }

  savePassword(): void {
    if (this.passwordNew() !== this.passwordConfirm()) {
      alert('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (this.passwordNew().length < 4) {
      alert('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    const res = this.authService.changePassword(
      this.passwordTargetUserId(),
      this.passwordNew(),
      this.passwordOld()
    );

    if (res.success) {
      this.showPasswordModal.set(false);
      this.showToast(res.message);
    } else {
      alert(res.message);
    }
  }

  deleteStaff(id: string, name: string): void {
    if (!this.authService.isOwner()) {
      alert('Apenas o Dono pode remover colaboradores.');
      return;
    }

    if (confirm(`Deseja realmente remover o colaborador "${name}" da equipe? Ele não poderá mais acessar o painel.`)) {
      const res = this.authService.deleteStaff(id);
      if (res.success) {
        this.showToast(res.message);
      } else {
        alert(res.message);
      }
    }
  }

  resetMockData(): void {
    if (confirm('Restaurar dados de exemplo iniciais? Suas inscrições de teste serão recarregadas com os dados modelo.')) {
      this.registrationService.resetAllData();
      this.showToast('Dados restaurados com sucesso para demonstração.');
    }
  }

  exportCurrentToCsv(): void {
    let csvContent = '';
    const view = this.activeView();

    if (view === 'students') {
      const data = this.rankedStudents();
      csvContent = 'PosicaoCurso;PosicaoGeral;TipoVaga;Protocolo;Nome;CPF;Email;Telefone;Curso;Turno;Status;DataCadastro\n' +
        data.map(d => `${d.coursePosition};${d.queuePosition};"${d.isTitular ? 'Vaga Titular' : 'Lista de Espera'}";${d.protocol};"${d.fullName}";"${d.cpf}";"${d.email}";"${d.phone}";"${d.courseName}";"${d.preferredShift}";"${d.status}";"${d.createdAt}"`).join('\n');
    } else if (view === 'volunteers') {
      const data = this.filteredVolunteers();
      csvContent = 'Protocolo;Nome;Email;Telefone;Profissao;Area;Disponibilidade;Status;Data\n' +
        data.map(d => `${d.protocol};"${d.fullName}";"${d.email}";"${d.phone}";"${d.occupation}";"${d.areaOfInterest}";"${d.availability}";"${d.status}";"${d.createdAt}"`).join('\n');
    } else if (view === 'pets') {
      const data = this.filteredPets();
      csvContent = 'Protocolo;Pet;Especie;Raca;Porte;Tutor;Telefone;Status;Data\n' +
        data.map(d => `${d.protocol};"${d.petName}";"${d.petSpecies}";"${d.petBreed}";"${d.petSize}";"${d.tutorName}";"${d.tutorPhone}";"${d.status}";"${d.createdAt}"`).join('\n');
    } else {
      const data = this.filteredStaff();
      csvContent = 'ID;Nome;Email;Cargo;Nivel;Telefone;Status;CriadoEm\n' +
        data.map(d => `${d.id};"${d.name}";"${d.email}";"${d.role}";"${d.isOwner ? 'Dono/Master' : 'Funcionario'}";"${d.phone}";"${d.active ? 'Ativo' : 'Inativo'}";"${d.createdAt}"`).join('\n');
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ong_maos_que_cuidam_${view}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Arquivo CSV baixado com sucesso!');
  }

  openCertificateModal(std: StudentRegistration): void {
    this.certificateStudent.set(std);
    this.certificateCode.set(`CERT-MQC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
    this.showCertificateModal.set(true);
  }

  printCertificate(): void {
    window.print();
  }

  getPetsForDay(day: string): PetRegistration[] {
    return this.registrationService.pets().filter(p => {
      if (p.preferredDay === 'Qualquer dia da semana') return true;
      return p.preferredDay.toLowerCase().includes(day.toLowerCase());
    });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }
}
