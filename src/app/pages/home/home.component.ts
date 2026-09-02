import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { Course, Testimonial, Sponsor, ImpactStat } from '../../models/registration.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private fb = inject(FormBuilder);
  registrationService = inject(RegistrationService);
  authService = inject(AuthService);

  courses: Course[] = this.registrationService.getCourses();
  testimonials = computed(() => this.registrationService.testimonials());
  sponsors = computed(() => this.registrationService.sponsors());
  stats = computed(() => this.registrationService.impactStats());

  showAddReviewModal = signal<boolean>(false);
  showEditStatsModal = signal<boolean>(false);
  editStatsList = signal<ImpactStat[]>([]);

  toastMessage = signal<string | null>(null);
  selectedRating = signal<number>(5);

  authorPhotoPreview = signal<string>('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80');

  reviewForm: FormGroup = this.fb.group({
    authorName: ['', [Validators.required, Validators.minLength(3)]],
    userType: ['Aluno(a) Formado(a)', Validators.required],
    currentRole: ['', [Validators.required, Validators.minLength(3)]],
    courseCompleted: ['Especialização em Tosa Comercial & Tesoura', Validators.required],
    story: ['', [Validators.required, Validators.minLength(15)]],
    rating: [5, Validators.required],
    avatarUrl: ['']
  });

  // Pilares
  pillars = [
    {
      title: 'Amor',
      tagline: 'Manejo Positivo e Acolhedor',
      desc: 'Ensinamos técnicas humanizadas de atendimento. Nenhum animal passa por estresse ou força física durante os procedimentos de banho e tosa.',
      icon: 'heart'
    },
    {
      title: 'Respeito',
      tagline: 'Oportunidade & Dignidade Humana',
      desc: 'Capacitamos pessoas em busca de emprego, jovens e mulheres chefes de família para conquistarem sua independência financeira com uma profissão digna.',
      icon: 'hands'
    },
    {
      title: 'Proteção',
      tagline: 'Cuidado & Saúde Preventiva',
      desc: 'Detectamos precocemente alterações na pele, ouvidos e olhos dos animais durante o banho, auxiliando na saúde integral dos pets da comunidade.',
      icon: 'shield'
    }
  ];

  // Gestão das Métricas de Impacto (Admin)
  openEditStatsModal(): void {
    const current = this.registrationService.impactStats();
    // Deep clone para edição
    this.editStatsList.set(JSON.parse(JSON.stringify(current)));
    this.showEditStatsModal.set(true);
  }

  saveEditedStats(): void {
    const list = this.editStatsList();
    this.registrationService.updateImpactStats(list);
    this.showEditStatsModal.set(false);
    this.showToast('✅ Métricas de impacto social atualizadas com sucesso!');
  }

  openReviewModal(): void {
    this.reviewForm.reset({
      userType: 'Aluno(a) Formado(a)',
      courseCompleted: 'Especialização em Tosa Comercial & Tesoura',
      rating: 5
    });
    this.selectedRating.set(5);
    this.showAddReviewModal.set(true);
  }

  setRating(stars: number): void {
    this.selectedRating.set(stars);
    this.reviewForm.patchValue({ rating: stars });
  }

  onPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.authorPhotoPreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  saveReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const val = this.reviewForm.value;
    const finalPhoto = val.avatarUrl?.trim() || this.authorPhotoPreview();

    this.registrationService.addTestimonial({
      authorName: val.authorName,
      currentRole: val.currentRole,
      courseCompleted: val.courseCompleted,
      year: new Date().getFullYear(),
      story: val.story,
      rating: this.selectedRating(),
      avatarUrl: finalPhoto
    });

    this.showAddReviewModal.set(false);
    this.showToast('🌟 Seu depoimento foi publicado com sucesso! Muito obrigado pelo carinho.');
  }

  deleteTestimonial(id: string, authorName: string): void {
    if (confirm(`Tem certeza que deseja remover o depoimento de "${authorName}"?`)) {
      this.registrationService.deleteTestimonial(id);
      this.showToast(`Depoimento de "${authorName}" removido com sucesso.`);
    }
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }
}
