import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { Course, Testimonial } from '../../models/registration.model';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent {
  private fb = inject(FormBuilder);
  registrationService = inject(RegistrationService);
  authService = inject(AuthService);

  courses: Course[] = this.registrationService.getCourses();
  testimonials = computed(() => this.registrationService.testimonials());

  selectedFilter = signal<string>('all');
  selectedCourseForModal = signal<Course | null>(null);

  showAddReviewModal = signal<boolean>(false);
  toastMessage = signal<string | null>(null);
  selectedRating = signal<number>(5);
  authorPhotoPreview = signal<string>('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80');

  reviewForm: FormGroup = this.fb.group({
    authorName: ['', [Validators.required, Validators.minLength(3)]],
    currentRole: ['', [Validators.required, Validators.minLength(3)]],
    courseCompleted: ['Especialização em Tosa Comercial', Validators.required],
    story: ['', [Validators.required, Validators.minLength(15)]],
    rating: [5, Validators.required],
    avatarUrl: ['']
  });

  filterCourses(filter: string): void {
    this.selectedFilter.set(filter);
  }

  get filteredCourses(): Course[] {
    const f = this.selectedFilter();
    if (f === 'all') return this.courses;
    if (f === 'iniciante') return this.courses.filter(c => c.level === 'Iniciante');
    if (f === 'avancado') return this.courses.filter(c => c.level === 'Intermediário' || c.level === 'Avançado');
    if (f === 'workshop') return this.courses.filter(c => c.modality === 'Workshop' || c.modality === 'Intensivo');
    return this.courses;
  }

  openCourseModal(course: Course): void {
    this.selectedCourseForModal.set(course);
  }

  closeCourseModal(): void {
    this.selectedCourseForModal.set(null);
  }

  openReviewModal(): void {
    this.reviewForm.reset({
      courseCompleted: 'Especialização em Tosa Comercial',
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
    this.showToast('🌟 Seu depoimento foi publicado com sucesso!');
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
