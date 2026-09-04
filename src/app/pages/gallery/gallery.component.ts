import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
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
  authService = inject(AuthService);

  activeSection = signal<'galeria' | 'cadastro-gratis'>('galeria');
  selectedPetForModal = signal<PetGalleryItem | null>(null);
  
  // Mapa de controle do toggle Antes/Depois por pet
  viewModeMap: { [key: string]: 'after' | 'before' } = {};

  // Estado do cadastro de pet modelo
  submittedModelDog = signal<PetRegistration | null>(null);

  // Notificação toast
  toastMessage = signal<string | null>(null);

  // Modal para adicionar nova foto à galeria
  showAddPhotoModal = signal<boolean>(false);
  showQuickLoginModal = signal<boolean>(false);
  loginEmail = signal<string>('');
  loginPassword = signal<string>('');
  loginError = signal<string | null>(null);

  beforePhotoPreview = signal<string>('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80');
  afterPhotoPreview = signal<string>('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80');

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
    serviceDesired: ['Banho + corte de unha + escovação dos dentes + limpeza do ouvido.', Validators.required],
    preferredDay: ['Segunda-feira à tarde', Validators.required],
    specialCareNotes: [''],
    isVaccinated: [true],
    agreeTerms: [false, Validators.requiredTrue]
  });

  // Formulário para Cadastrar Nova Foto na Galeria (Campos fiéis ao Card da Foto)
  newPhotoForm: FormGroup = this.fb.group({
    petName: ['', [Validators.required, Validators.minLength(2)]],
    category: ['TOSA BEBÊ', Validators.required], // Tag pill (ex: Tosa Bebê, Banho & Desembolo)
    breed: ['Poodle Toy Resgatado', Validators.required], // Raça / Espécie (ex: Poodle Toy Resgatado)
    serviceDone: ['Tosa Bebê & Banho Hipoalergênico', Validators.required], // Procedimento
    story: ['', [Validators.required, Validators.minLength(15)]], // História da transformação
    studentName: ['', [Validators.required, Validators.minLength(3)]], // Aluno Responsável (Turma)
    instructorName: ['Prof. Carlos Eduardo', Validators.required], // Supervisão
    instagramPostUrl: ['https://www.instagram.com/maosquecuidam_4/'], // Link do Instagram
    beforeImageUrl: [''],
    afterImageUrl: [''],
    likesCount: [41]
  });

  get galleryItems(): PetGalleryItem[] {
    return this.registrationService.getGalleryItems();
  }

  setSection(sec: 'galeria' | 'cadastro-gratis'): void {
    this.activeSection.set(sec);
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
    this.showToast(`❤️ Você curtiu o(a) ${item.petName}! Siga nosso Instagram oficial @maosquecuidam_4`);
  }

  deleteGalleryPhoto(item: PetGalleryItem, event: Event): void {
    event.stopPropagation();
    if (confirm(`Tem certeza que deseja remover a foto de "${item.petName}" da galeria?`)) {
      this.registrationService.deleteGalleryItem(item.id);
      this.showToast(`Foto de "${item.petName}" removida da galeria com sucesso.`);
    }
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }

  openModal(item: PetGalleryItem): void {
    this.selectedPetForModal.set(item);
  }

  closeModal(): void {
    this.selectedPetForModal.set(null);
  }

  // Lightbox de Imagem em Tela Cheia / Visualização Completa
  fullscreenImage = signal<{ url: string; title: string; subtitle?: string; tag?: string; petItem?: PetGalleryItem } | null>(null);

  openFullscreenImage(url: string, title: string, subtitle?: string, tag?: string, petItem?: PetGalleryItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.fullscreenImage.set({ url, title, subtitle, tag, petItem });
  }

  closeFullscreenImage(): void {
    this.fullscreenImage.set(null);
  }

  switchFullscreenMode(mode: 'before' | 'after'): void {
    const current = this.fullscreenImage();
    if (current && current.petItem) {
      if (mode === 'before') {
        this.fullscreenImage.set({
          url: current.petItem.beforeImageUrl,
          title: current.petItem.petName,
          subtitle: current.petItem.serviceDone,
          tag: 'ANTES DA AULA',
          petItem: current.petItem
        });
      } else {
        this.fullscreenImage.set({
          url: current.petItem.afterImageUrl,
          title: current.petItem.petName,
          subtitle: current.petItem.serviceDone,
          tag: 'DEPOIS DO CUIDADO',
          petItem: current.petItem
        });
      }
    }
  }

  handleOpenAddPhoto(): void {
    if (this.authService.isAuthenticated()) {
      this.showAddPhotoModal.set(true);
    } else {
      this.loginError.set(null);
      this.showQuickLoginModal.set(true);
    }
  }

  submitQuickLogin(): void {
    this.loginError.set(null);
    const res = this.authService.login(this.loginEmail(), this.loginPassword());
    if (res.success) {
      this.showQuickLoginModal.set(false);
      this.showAddPhotoModal.set(true);
    } else {
      this.loginError.set(res.message);
    }
  }

  onBeforeFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.beforePhotoPreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onAfterFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.afterPhotoPreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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
    const beforeUrl = val.beforeImageUrl?.trim() || this.beforePhotoPreview();
    const afterUrl = val.afterImageUrl?.trim() || this.afterPhotoPreview();

    this.registrationService.addGalleryItem({
      petName: val.petName,
      species: 'Cão',
      breed: val.breed,
      serviceDone: val.serviceDone,
      beforeImageUrl: beforeUrl,
      afterImageUrl: afterUrl,
      story: val.story,
      studentName: val.studentName,
      instructorName: val.instructorName,
      category: val.category,
      likesCount: val.likesCount || 1,
      instagramPostUrl: val.instagramPostUrl || 'https://www.instagram.com/maosquecuidam_4/'
    });

    // Fecha a aba / modal
    this.showAddPhotoModal.set(false);

    // Reseta o formulário
    this.newPhotoForm.reset({
      category: 'TOSA BEBÊ',
      breed: 'Poodle Toy Resgatado',
      serviceDone: 'Tosa Bebê & Banho Hipoalergênico',
      instructorName: 'Prof. Carlos Eduardo',
      instagramPostUrl: 'https://www.instagram.com/maosquecuidam_4/',
      likesCount: 41
    });

    // Exibe notificação de salvo com sucesso
    this.showToast(`✅ Salvo com sucesso! A foto do pet "${val.petName}" foi publicada na galeria.`);
  }
}
