import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { Course, StudentRegistration, VolunteerRegistration, PetRegistration } from '../../models/registration.model';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private registrationService = inject(RegistrationService);
  public notificationService = inject(NotificationService);

  activeTab = signal<'aluno' | 'voluntario' | 'pet'>('aluno');
  get courses(): Course[] {
    return this.registrationService.getCourses();
  }

  // Estados de confirmação
  submittedStudent = signal<StudentRegistration | null>(null);
  submittedVolunteer = signal<VolunteerRegistration | null>(null);
  submittedPet = signal<PetRegistration | null>(null);

  // Multi-seleção de cursos: permite selecionar 1, 2, 3 ou todos os 4 cursos de uma vez
  selectedCourseIds = signal<string[]>([]);
  showSuccessModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  // Formulários Reativos
  studentForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    birthDate: ['', Validators.required],
    city: ['Macaé', Validators.required],
    neighborhood: ['', Validators.required],
    preferredShift: ['Tarde (13:00 às 17:00)', Validators.required],
    employmentStatus: ['Buscando primeira oportunidade na área', Validators.required],
    hasPetExperience: [false],
    motivation: ['', [Validators.required, Validators.minLength(3)]],
    agreeTerms: [true, Validators.requiredTrue]
  });

  volunteerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    occupation: ['', Validators.required],
    areaOfInterest: ['Instrutor de Banho e Tosa', Validators.required],
    experienceDescription: ['', [Validators.required, Validators.minLength(5)]],
    availability: ['', Validators.required],
    agreeTerms: [false, Validators.requiredTrue]
  });

  petForm: FormGroup = this.fb.group({
    tutorName: ['', [Validators.required, Validators.minLength(3)]],
    tutorPhone: ['', [Validators.required, Validators.minLength(10)]],
    tutorCpf: ['', [Validators.required, Validators.minLength(11)]],
    petName: ['', Validators.required],
    petSpecies: ['Cão', Validators.required],
    petBreed: ['Sem Raça Definida (SRD)', Validators.required],
    petSize: ['Porte Médio (10kg a 25kg)', Validators.required],
    petAge: ['', Validators.required],
    isVaccinated: [true],
    specialCareNotes: [''],
    preferredDay: ['Qualquer dia da semana', Validators.required],
    agreeTerms: [false, Validators.requiredTrue]
  });

  ngOnInit(): void {
    // Por padrão, seleciona os 4 cursos oficiais (formação completa)
    this.selectedCourseIds.set(this.courses.map(c => c.id));

    // Escutar queryParams para pré-seleção de curso ou aba
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        if (params['tab'] === 'voluntario' || params['tab'] === 'pet' || params['tab'] === 'aluno') {
          this.activeTab.set(params['tab']);
        }
      }
      if (params['curso']) {
        this.activeTab.set('aluno');
        const courseExists = this.courses.find(c => c.id === params['curso']);
        if (courseExists) {
          this.selectedCourseIds.set([params['curso']]);
        }
      }
    });
  }

  toggleCourse(id: string): void {
    const current = this.selectedCourseIds();
    if (current.includes(id)) {
      if (current.length > 1) {
        this.selectedCourseIds.set(current.filter(c => c !== id));
      } else {
        alert('Você deve manter pelo menos 1 curso selecionado.');
      }
    } else {
      this.selectedCourseIds.set([...current, id]);
    }
  }

  toggleAllCourses(): void {
    if (this.isAllCoursesSelected()) {
      // Se todos já estavam selecionados, deixa o principal
      this.selectedCourseIds.set([this.courses[0].id]);
    } else {
      // Seleciona todos os 4 cursos da ONG
      this.selectedCourseIds.set(this.courses.map(c => c.id));
    }
  }

  isAllCoursesSelected(): boolean {
    return this.courses.length > 0 && this.selectedCourseIds().length === this.courses.length;
  }

  isCourseSelected(id: string): boolean {
    return this.selectedCourseIds().includes(id);
  }

  getStudentFormErrors(): string[] {
    const errors: string[] = [];
    const f = this.studentForm;

    if (this.selectedCourseIds().length === 0) errors.push('Selecione ao menos 1 curso desejado');
    if (f.get('fullName')?.invalid) errors.push('Nome Completo (mínimo 3 letras)');
    if (f.get('cpf')?.invalid) errors.push('CPF (mínimo 11 dígitos)');
    if (f.get('phone')?.invalid) errors.push('WhatsApp com DDD (mínimo 10 dígitos)');
    if (f.get('email')?.invalid) errors.push('E-mail de contato válido');
    if (f.get('birthDate')?.invalid) errors.push('Data de nascimento');
    if (f.get('city')?.invalid) errors.push('Cidade');
    if (f.get('neighborhood')?.invalid) errors.push('Bairro');
    if (f.get('preferredShift')?.invalid) errors.push('Turno de preferência');
    if (f.get('motivation')?.invalid) errors.push('Motivação / Por que deseja fazer o curso');
    if (f.get('agreeTerms')?.invalid) errors.push('Termos do projeto social (marcar caixinha obrigatória)');

    return errors;
  }

  setTab(tab: 'aluno' | 'voluntario' | 'pet'): void {
    this.activeTab.set(tab);
    // Limpar protocolos anteriores se mudar de aba
    this.submittedStudent.set(null);
    this.submittedVolunteer.set(null);
    this.submittedPet.set(null);
    this.showSuccessModal.set(false);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
  }

  // --- SUBMISSÕES ---
  async submitStudent(): Promise<void> {
    if (this.studentForm.invalid || this.selectedCourseIds().length === 0) {
      this.studentForm.markAllAsTouched();
      const errs = this.getStudentFormErrors();
      alert('Por favor, preencha os campos obrigatórios em destaque para concluir sua inscrição:\n\n• ' + errs.join('\n• '));
      return;
    }

    this.isSubmitting.set(true);

    try {
      const val = this.studentForm.value;
      const selectedCourses = this.courses.filter(c => this.selectedCourseIds().includes(c.id));
      const selectedCourseNames = selectedCourses.map(c => c.title);
      const primaryCourse = selectedCourses[0] || this.courses[0];

      let formattedCourseName: string;
      if (this.isAllCoursesSelected()) {
        formattedCourseName = '⭐ Formação Completa em Todos os 4 Cursos (Embelezamento e Higiene + Estética Animal + Cuidados + Empreendedorismo)';
      } else if (selectedCourseNames.length > 1) {
        formattedCourseName = selectedCourseNames.join(' + ');
      } else {
        formattedCourseName = primaryCourse.title;
      }

      const created = await this.registrationService.registerStudent({
        fullName: val.fullName,
        email: val.email,
        phone: val.phone,
        cpf: val.cpf,
        birthDate: val.birthDate,
        city: val.city,
        neighborhood: val.neighborhood,
        courseId: primaryCourse.id,
        courseName: formattedCourseName,
        selectedCourseIds: this.selectedCourseIds(),
        selectedCourseNames: selectedCourseNames,
        preferredShift: val.preferredShift,
        employmentStatus: val.employmentStatus,
        hasPetExperience: val.hasPetExperience,
        motivation: val.motivation
      });

      this.submittedStudent.set(created);
      this.showSuccessModal.set(true);

      // Reseta mantendo padrões amigáveis
      this.studentForm.reset({
        city: 'Macaé',
        preferredShift: 'Tarde (13:00 às 17:00)',
        employmentStatus: 'Buscando primeira oportunidade na área',
        hasPetExperience: false,
        agreeTerms: true
      });
      this.selectedCourseIds.set(this.courses.map(c => c.id));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  submitVolunteer(): void {
    if (this.volunteerForm.invalid) {
      this.volunteerForm.markAllAsTouched();
      return;
    }

    const val = this.volunteerForm.value;
    const created = this.registrationService.registerVolunteer({
      fullName: val.fullName,
      email: val.email,
      phone: val.phone,
      occupation: val.occupation,
      areaOfInterest: val.areaOfInterest,
      experienceDescription: val.experienceDescription,
      availability: val.availability
    });

    this.submittedVolunteer.set(created);
    this.volunteerForm.reset({
      areaOfInterest: 'Instrutor de Banho e Tosa',
      agreeTerms: false
    });
  }

  submitPet(): void {
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }

    const val = this.petForm.value;
    const created = this.registrationService.registerPet({
      tutorName: val.tutorName,
      tutorPhone: val.tutorPhone,
      tutorCpf: val.tutorCpf,
      petName: val.petName,
      petSpecies: val.petSpecies,
      petBreed: val.petBreed,
      petSize: val.petSize,
      petAge: val.petAge,
      isVaccinated: val.isVaccinated,
      specialCareNotes: val.specialCareNotes || 'Nenhuma observação especial',
      preferredDay: val.preferredDay
    });

    this.submittedPet.set(created);
    this.petForm.reset({
      petSpecies: 'Cão',
      petBreed: 'Sem Raça Definida (SRD)',
      petSize: 'Porte Médio (10kg a 25kg)',
      isVaccinated: true,
      preferredDay: 'Qualquer dia da semana',
      agreeTerms: false
    });
  }

  printProtocol(): void {
    window.print();
  }

  getStudentQueueRank(std: StudentRegistration | null): { position: number; isTitular: boolean; waitingNumber?: number } {
    if (!std) return { position: 1, isTitular: true };
    const allStudents = this.registrationService.students();
    const sorted = [...allStudents].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const courseStudents = sorted.filter(s => s.courseId === std.courseId);
    const idx = courseStudents.findIndex(s => s.id === std.id);
    const pos = idx >= 0 ? idx + 1 : courseStudents.length;
    const isTitular = pos <= 15;
    return {
      position: pos,
      isTitular,
      waitingNumber: isTitular ? undefined : (pos - 15)
    };
  }

  resetCurrentSubmission(): void {
    this.submittedStudent.set(null);
    this.submittedVolunteer.set(null);
    this.submittedPet.set(null);
  }
}
