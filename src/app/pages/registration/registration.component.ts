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
  courses: Course[] = this.registrationService.getCourses();

  // Estados de confirmação
  submittedStudent = signal<StudentRegistration | null>(null);
  submittedVolunteer = signal<VolunteerRegistration | null>(null);
  submittedPet = signal<PetRegistration | null>(null);

  // Formulários Reativos
  studentForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    birthDate: ['', Validators.required],
    city: ['Macaé', Validators.required],
    neighborhood: ['', Validators.required],
    courseId: ['curso-banho-higienizacao', Validators.required],
    preferredShift: ['Manhã (08h às 12h)', Validators.required],
    employmentStatus: ['Buscando primeira oportunidade na área', Validators.required],
    hasPetExperience: [false],
    motivation: ['', [Validators.required, Validators.minLength(15)]],
    agreeTerms: [false, Validators.requiredTrue]
  });

  volunteerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    occupation: ['', Validators.required],
    areaOfInterest: ['Instrutor de Banho e Tosa', Validators.required],
    experienceDescription: ['', [Validators.required, Validators.minLength(15)]],
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
          this.studentForm.patchValue({ courseId: params['curso'] });
        }
      }
    });
  }

  setTab(tab: 'aluno' | 'voluntario' | 'pet'): void {
    this.activeTab.set(tab);
    // Limpar protocolos anteriores se mudar de aba
    this.submittedStudent.set(null);
    this.submittedVolunteer.set(null);
    this.submittedPet.set(null);
  }

  // --- SUBMISSÕES ---
  submitStudent(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const val = this.studentForm.value;
    const selectedCourse = this.courses.find(c => c.id === val.courseId);

    const created = this.registrationService.registerStudent({
      fullName: val.fullName,
      email: val.email,
      phone: val.phone,
      cpf: val.cpf,
      birthDate: val.birthDate,
      city: val.city,
      neighborhood: val.neighborhood,
      courseId: val.courseId,
      courseName: selectedCourse ? selectedCourse.title : 'Curso de Banho e Tosa',
      preferredShift: val.preferredShift,
      employmentStatus: val.employmentStatus,
      hasPetExperience: val.hasPetExperience,
      motivation: val.motivation
    });

    this.submittedStudent.set(created);
    this.studentForm.reset({
      city: 'São Paulo',
      courseId: 'curso-banho-higienizacao',
      preferredShift: 'Manhã (08h às 12h)',
      employmentStatus: 'Buscando primeira oportunidade na área',
      hasPetExperience: false,
      agreeTerms: false
    });
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
