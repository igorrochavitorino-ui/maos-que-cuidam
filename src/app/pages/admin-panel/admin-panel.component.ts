import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { StudentRegistration, VolunteerRegistration, PetRegistration, RegistrationStatus } from '../../models/registration.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  registrationService = inject(RegistrationService);

  activeView = signal<'students' | 'volunteers' | 'pets'>('students');
  searchQuery = signal<string>('');
  statusFilter = signal<string>('all');

  // Modal de detalhes
  selectedStudent = signal<StudentRegistration | null>(null);
  selectedVolunteer = signal<VolunteerRegistration | null>(null);
  selectedPet = signal<PetRegistration | null>(null);

  // Notificação toast
  toastMessage = signal<string | null>(null);

  // Listas filtradas reativas
  filteredStudents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.statusFilter();
    return this.registrationService.students().filter(s => {
      const matchesQuery = !q || s.fullName.toLowerCase().includes(q) || s.protocol.toLowerCase().includes(q) || s.cpf.includes(q) || s.courseName.toLowerCase().includes(q);
      const matchesStatus = st === 'all' || s.status === st;
      return matchesQuery && matchesStatus;
    });
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

  setView(view: 'students' | 'volunteers' | 'pets'): void {
    this.activeView.set(view);
    this.searchQuery.set('');
    this.statusFilter.set('all');
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
      const data = this.filteredStudents();
      csvContent = 'Protocolo;Nome;CPF;Email;Telefone;Curso;Turno;Status;Data\n' +
        data.map(d => `${d.protocol};"${d.fullName}";"${d.cpf}";"${d.email}";"${d.phone}";"${d.courseName}";"${d.preferredShift}";"${d.status}";"${d.createdAt}"`).join('\n');
    } else if (view === 'volunteers') {
      const data = this.filteredVolunteers();
      csvContent = 'Protocolo;Nome;Email;Telefone;Profissao;Area;Disponibilidade;Status;Data\n' +
        data.map(d => `${d.protocol};"${d.fullName}";"${d.email}";"${d.phone}";"${d.occupation}";"${d.areaOfInterest}";"${d.availability}";"${d.status}";"${d.createdAt}"`).join('\n');
    } else {
      const data = this.filteredPets();
      csvContent = 'Protocolo;Pet;Especie;Raca;Porte;Tutor;Telefone;Status;Data\n' +
        data.map(d => `${d.protocol};"${d.petName}";"${d.petSpecies}";"${d.petBreed}";"${d.petSize}";"${d.tutorName}";"${d.tutorPhone}";"${d.status}";"${d.createdAt}"`).join('\n');
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

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }
}
