import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { Course } from '../../models/registration.model';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent {
  registrationService = inject(RegistrationService);
  courses: Course[] = this.registrationService.getCourses();

  selectedFilter = signal<string>('all');
  selectedCourseForModal = signal<Course | null>(null);

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
}
