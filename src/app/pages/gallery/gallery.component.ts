import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { PetGalleryItem, PetRegistration } from '../../models/registration.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent {
  private fb = inject(FormBuilder);
  registrationService = inject(RegistrationService);

  activeSection = signal<'galeria' | 'cadastro-gratis'>('galeria');
  selectedCategory = signal<string>('all');
  selectedPetForModal = signal<PetGalleryItem | null>(null);

  // Controle de exibição antes/depois por card (mapa de IDs)
  viewModeMap: { [id: string]: 'after' | 'before' } = {};

  // Confirmação de cadastro do pet modelo
  submittedModelDog = signal<PetRegistration | null>(null);

  // Modal para adicionar nova foto
  showAddPhotoModal = signal<boolean>(false);

  // Formulário de Cadastro do Cão Modelo para Banho/Tosa Grátis
  dogModelForm: FormGroup = this.fb.group({
    tutorName: ['', [Validators.required, Validators.minLength(3)]],
    tutorPhone: ['', [Validators.required, Validators.minLength(10)]],
    tutorCpf: ['', [Validators.required, Validators.minLength(11)]],
    petName: ['', [Validators.required, Validators.minLength(2)]],
    petSpecies: ['Cão', Validators.required],
    petBreed: ['Sem Raça Definida (SRD)', Validators.required],
    petSize: ['Porte Médio (10kg a 25kg)', Validators.required],
    petAge: ['', Validators.required],
    serviceDesired: ['Banho Completo com Hidratação', Validators.required],
    preferredDay: ['Sábados pela manhã', Validators.required],
    specialCareNotes: [''],
    isVaccinated: [true],
    agreeTerms: [false, Validators.requiredTrue]
  });

  // Formulário para Cadastrar Nova Foto na Galeria
  newPhotoForm: FormGroup = this.fb.group({
    petName: ['', Validators.required],
    species: ['Cão', Validators.required],
    breed: ['', Validators.required],
    serviceDone: ['', Validators.required],
    beforeImageUrl: ['', Validators.required],
    afterImageUrl: ['', Validators.required],
    story: ['', [Validators.required, Validators.minLength(15)]],
    studentName: ['', Validators.required],
    instructorName: ['', Validators.required],
    category: ['Antes & Depois', Validators.required]
  });

  get galleryItems(): PetGalleryItem[] {
    const items = this.registrationService.getGalleryItems();
    const cat = this.selectedCategory();
    if (cat === 'all') return items;
    return items.filter(i => i.category === cat);
  }

  setSection(sec: 'galeria' | 'cadastro-gratis'): void {
    this.activeSection.set(sec);
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  toggleViewMode(petId: string, mode: 'after' | 'before'): void {
    this.viewModeMap[petId] = mode;
  }

  getViewMode(petId: string): 'after' | 'before' {
    return this.viewModeMap[petId] || 'after';
  }

  likePet(item: PetGalleryItem, event: Event): void {
    event.stopPropagation();
    this.registrationService.likeGalleryItem(item.id);
  }

  openModal(item: PetGalleryItem): void {
    this.selectedPetForModal.set(item);
  }

  closeModal(): void {
    this.selectedPetForModal.set(null);
  }

  submitDogModel(): void {
    if (this.dogModelForm.invalid) {
      this.dogModelForm.markAllAsTouched();
      return;
    }

    const val = this.dogModelForm.value;
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
      specialCareNotes: `Serviço Solicitado: ${val.serviceDesired}. Observações: ${val.specialCareNotes || 'Nenhuma'}`,
      preferredDay: val.preferredDay
    });

    this.submittedModelDog.set(created);
    this.dogModelForm.reset({
      petSpecies: 'Cão',
      petBreed: 'Sem Raça Definida (SRD)',
      petSize: 'Porte Médio (10kg a 25kg)',
      serviceDesired: 'Banho Completo com Hidratação',
      preferredDay: 'Sábados pela manhã',
      isVaccinated: true,
      agreeTerms: false
    });
  }

  submitNewPhoto(): void {
    if (this.newPhotoForm.invalid) {
      this.newPhotoForm.markAllAsTouched();
      return;
    }

    const val = this.newPhotoForm.value;
    this.registrationService.addGalleryItem({
      petName: val.petName,
      species: val.species,
      breed: val.breed,
      serviceDone: val.serviceDone,
      beforeImageUrl: val.beforeImageUrl,
      afterImageUrl: val.afterImageUrl,
      story: val.story,
      studentName: val.studentName,
      instructorName: val.instructorName,
      category: val.category
    });

    this.showAddPhotoModal.set(false);
    this.newPhotoForm.reset({
      species: 'Cão',
      category: 'Antes & Depois'
    });
  }
}
