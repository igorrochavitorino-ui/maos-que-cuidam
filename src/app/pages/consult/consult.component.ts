import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { StudentRegistration, PetRegistration, VolunteerRegistration, AdoptionApplication } from '../../models/registration.model';

export type SearchResultType = 'student' | 'pet' | 'volunteer' | 'adoption';

export interface SearchResultItem {
  type: SearchResultType;
  title: string;
  protocol: string;
  maskedName: string;
  category: string;
  detail: string;
  status: string;
  createdAt: string;
  data: any;
}

@Component({
  selector: 'app-consult',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consult.component.html',
  styleUrls: ['./consult.component.css']
})
export class ConsultComponent {
  private registrationService = inject(RegistrationService);
  notificationService = inject(NotificationService);

  searchQuery = signal<string>('');
  hasSearched = signal<boolean>(false);
  results = signal<SearchResultItem[]>([]);

  onSearch(): void {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      this.results.set([]);
      this.hasSearched.set(false);
      return;
    }

    this.hasSearched.set(true);
    const cleanNumbers = q.replace(/\D/g, '');
    const found: SearchResultItem[] = [];

    // 1. Busca em Alunos
    this.registrationService.students().forEach(s => {
      const matchProtocol = s.protocol.toLowerCase().includes(q);
      const matchCpf = cleanNumbers && s.cpf.replace(/\D/g, '').includes(cleanNumbers);
      const matchEmail = s.email.toLowerCase().includes(q);

      if (matchProtocol || matchCpf || matchEmail) {
        found.push({
          type: 'student',
          title: 'Inscrição para Curso Profissionalizante',
          protocol: s.protocol,
          maskedName: this.maskName(s.fullName),
          category: s.courseName,
          detail: `Turno: ${s.preferredShift} • Cidade: ${s.city}/${s.neighborhood}`,
          status: s.status,
          createdAt: s.createdAt,
          data: s
        });
      }
    });

    // 2. Busca em Pets de Banho Social
    this.registrationService.pets().forEach(p => {
      const matchProtocol = p.protocol.toLowerCase().includes(q);
      const matchCpf = cleanNumbers && p.tutorCpf?.replace(/\D/g, '').includes(cleanNumbers);
      const matchPhone = cleanNumbers && p.tutorPhone.replace(/\D/g, '').includes(cleanNumbers);

      if (matchProtocol || matchCpf || matchPhone) {
        found.push({
          type: 'pet',
          title: 'Cadastro de Pet para Banho Social Gratuito',
          protocol: p.protocol,
          maskedName: `Pet: ${p.petName} (Tutor(a): ${this.maskName(p.tutorName)})`,
          category: `${p.petSpecies} - ${p.petBreed} (${p.petSize})`,
          detail: `Dia Preferencial: ${p.preferredDay}`,
          status: p.status,
          createdAt: p.createdAt,
          data: p
        });
      }
    });

    // 3. Busca em Voluntários
    this.registrationService.volunteers().forEach(v => {
      const matchProtocol = v.protocol.toLowerCase().includes(q);
      const matchEmail = v.email.toLowerCase().includes(q);
      const matchPhone = cleanNumbers && v.phone.replace(/\D/g, '').includes(cleanNumbers);

      if (matchProtocol || matchEmail || matchPhone) {
        found.push({
          type: 'volunteer',
          title: 'Cadastro de Voluntário / Instrutor Parceiro',
          protocol: v.protocol,
          maskedName: this.maskName(v.fullName),
          category: v.areaOfInterest,
          detail: `Profissão: ${v.occupation} • Disponibilidade: ${v.availability}`,
          status: v.status,
          createdAt: v.createdAt,
          data: v
        });
      }
    });

    // 4. Busca em Pedidos de Adoção
    this.registrationService.adoptionApplications().forEach((a: AdoptionApplication) => {
      const matchProtocol = a.protocol.toLowerCase().includes(q);
      const matchCpf = cleanNumbers && a.adopterCpf.replace(/\D/g, '').includes(cleanNumbers);

      if (matchProtocol || matchCpf) {
        found.push({
          type: 'adoption',
          title: 'Interesse no Mural de Adoção Responsável',
          protocol: a.protocol,
          maskedName: `Adotante: ${this.maskName(a.adopterName)} (Pet: ${a.petName})`,
          category: `Adoção do(a) ${a.petName}`,
          detail: `Moradia: ${a.residenceType}`,
          status: a.status,
          createdAt: a.createdAt,
          data: a
        });
      }
    });

    this.results.set(found);
  }

  maskName(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].slice(0, 2) + '***';
    }
    return parts.map((p, i) => {
      if (i === 0 || i === parts.length - 1) {
        return p.slice(0, 1) + '***' + p.slice(-1);
      }
      return '***';
    }).join(' ');
  }

  getHelpWhatsappLink(item: SearchResultItem): string {
    const text = `Olá, equipe da *ONG Mãos que Cuidam*! 🐾\n\n` +
      `Estou consultando o andamento do meu protocolo *${item.protocol}* (${item.title}) e gostaria de mais informações.`;
    return `https://wa.me/5522998481112?text=${encodeURIComponent(text)}`;
  }
}
