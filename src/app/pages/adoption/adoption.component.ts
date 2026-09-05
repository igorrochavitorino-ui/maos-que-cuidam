import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { AdoptablePet, AdoptionApplication } from '../../models/registration.model';

@Component({
  selector: 'app-adoption',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './adoption.component.html',
  styleUrls: ['./adoption.component.css']
})
export class AdoptionComponent {
  private fb = inject(FormBuilder);
  registrationService = inject(RegistrationService);
  authService = inject(AuthService);

  activeTab = signal<'adotar' | 'doar'>('adotar');
  speciesFilter = signal<'all' | 'Cão' | 'Gato'>('all');
  sizeFilter = signal<string>('all');
  ageFilter = signal<string>('all');
  statusFilter = signal<'all' | 'Disponível' | 'Adotado'>('all');

  selectedPetForAdoption = signal<AdoptablePet | null>(null);
  selectedPetForDetails = signal<AdoptablePet | null>(null);
  submittedApplication = signal<AdoptionApplication | null>(null);
  submittedDonation = signal<AdoptablePet | null>(null);

  // Modal do Termo de Adoção Direto
  showContractModal = signal<boolean>(false);
  contractPet = signal<AdoptablePet | null>(null);
  contractAdopter = signal<AdoptionApplication | null>(null);

  // Previews das 3 fotos em upload (Foto 1 Principal + Foto 2 + Foto 3)
  photoPreview1 = signal<string>('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80');
  photoPreview2 = signal<string | null>(null);
  photoPreview3 = signal<string | null>(null);

  // Controle de fotos exibidas nos cards e no modal
  cardActivePhoto: { [petId: string]: number } = {};
  activeDetailsPhotoIndex = signal<number>(0);

  // Formulário para Cadastrar Pet para Doação com Questionário de Adoção Responsável
  donationForm: FormGroup = this.fb.group({
    donorName: ['', [Validators.required, Validators.minLength(3)]],
    donorCpf: ['', [Validators.required, Validators.minLength(11)]],
    donorPhone: ['', [Validators.required, Validators.minLength(10)]],
    donorEmail: ['', [Validators.required, Validators.email]],
    donorType: ['Protetor Independente', Validators.required],
    city: ['Macaé', Validators.required],
    neighborhood: ['', Validators.required],
    petName: ['', [Validators.required, Validators.minLength(2)]],
    species: ['Cão', Validators.required],
    gender: ['Macho', Validators.required],
    ageCategory: ['Adulto', Validators.required],
    ageText: ['2 anos', Validators.required],
    size: ['Porte Médio', Validators.required],
    breed: ['Sem Raça Definida (SRD)', Validators.required],
    
    // Questionário de Adoção Responsável & Saúde do Animal
    isVaccinated: [true, Validators.required],
    vaccineDetails: ['Vacinação V8/V10 e Antirrábica em dia', Validators.required],
    isCastrated: [true, Validators.required],
    isDewormed: [true, Validators.required],
    isSpecialNeeds: [false],
    aggressionHistory: ['Sem histórico de agressividade (Dócil e sociável)', [Validators.required, Validators.minLength(5)]],
    temperament: ['', [Validators.required, Validators.minLength(5)]],
    story: ['', [Validators.required, Validators.minLength(5)]],
    
    // Declaração de Responsabilidade do Protetor Original
    protectionDeclaration: [false, Validators.requiredTrue],
    agreeTerms: [false, Validators.requiredTrue]
  });

  // Notificação de validação do formulário
  formValidationErrors = signal<string[]>([]);
  isSubmitting = signal<boolean>(false);

  // Formulário para Quero Adotar (Interesse de Adoção)
  adoptionInterestForm: FormGroup = this.fb.group({
    adopterName: ['', [Validators.required, Validators.minLength(3)]],
    adopterEmail: ['', [Validators.required, Validators.email]],
    adopterPhone: ['', [Validators.required, Validators.minLength(10)]],
    adopterCpf: ['', [Validators.required, Validators.minLength(11)]],
    adopterAddress: ['', [Validators.required, Validators.minLength(8)]],
    residenceType: ['Casa com Quintal Murado', Validators.required],
    hasOtherPets: [false],
    motivation: ['', [Validators.required, Validators.minLength(15)]],
    agreeDirectContractTerms: [false, Validators.requiredTrue]
  });

  get filteredPets(): AdoptablePet[] {
    let pets = this.registrationService.getAdoptablePets();

    if (this.statusFilter() !== 'all') {
      pets = pets.filter(p => p.status === this.statusFilter());
    }

    if (this.speciesFilter() !== 'all') {
      pets = pets.filter(p => p.species === this.speciesFilter());
    }

    if (this.sizeFilter() !== 'all') {
      pets = pets.filter(p => p.size === this.sizeFilter());
    }

    if (this.ageFilter() !== 'all') {
      pets = pets.filter(p => p.ageCategory === this.ageFilter());
    }

    return pets;
  }

  getPetPhotos(pet: AdoptablePet | null | undefined): string[] {
    if (!pet) return [];
    const list = [pet.photoUrl, ...(pet.additionalPhotos || [])].filter(p => !!p && p.trim().length > 0);
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80'];
  }

  getCardPhoto(pet: AdoptablePet): string {
    const photos = this.getPetPhotos(pet);
    const idx = (this.cardActivePhoto[pet.id] || 0) % photos.length;
    return photos[idx];
  }

  getCardPhotoIndex(petId: string): number {
    return this.cardActivePhoto[petId] || 0;
  }

  setCardPhotoIndex(petId: string, index: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.cardActivePhoto[petId] = index;
  }

  nextCardPhoto(pet: AdoptablePet, event?: Event): void {
    if (event) event.stopPropagation();
    const photos = this.getPetPhotos(pet);
    const current = this.cardActivePhoto[pet.id] || 0;
    this.cardActivePhoto[pet.id] = (current + 1) % photos.length;
  }

  prevCardPhoto(pet: AdoptablePet, event?: Event): void {
    if (event) event.stopPropagation();
    const photos = this.getPetPhotos(pet);
    const current = this.cardActivePhoto[pet.id] || 0;
    this.cardActivePhoto[pet.id] = (current - 1 + photos.length) % photos.length;
  }

  setDetailsPhotoIndex(index: number): void {
    this.activeDetailsPhotoIndex.set(index);
  }

  nextDetailsPhoto(): void {
    const photos = this.getPetPhotos(this.selectedPetForDetails());
    if (photos.length > 1) {
      this.activeDetailsPhotoIndex.update(idx => (idx + 1) % photos.length);
    }
  }

  prevDetailsPhoto(): void {
    const photos = this.getPetPhotos(this.selectedPetForDetails());
    if (photos.length > 1) {
      this.activeDetailsPhotoIndex.update(idx => (idx - 1 + photos.length) % photos.length);
    }
  }

  sharePetOnWhatsapp(pet: AdoptablePet): void {
    const text = `Olhem esse amorzinho para adoção responsável na ONG Mãos que Cuidam em Macaé/RJ! 🐾❤️\n\n` +
      `🐾 *Nome:* ${pet.name} (${pet.species} - ${pet.breed})\n` +
      `📏 *Porte:* ${pet.size} | *Idade:* ${pet.ageText}\n` +
      `💖 *Temperamento:* ${pet.temperament}\n` +
      `📍 *Local:* ${pet.neighborhood} - ${pet.city}/RJ\n\n` +
      `Veja a história dele e adote com amor:\n` +
      `http://localhost:4200/adocao`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  toggleAdoptedStatus(pet: AdoptablePet): void {
    const newStatus = pet.status === 'Adotado' ? 'Disponível' : 'Adotado';
    this.registrationService.updateAdoptablePetStatus(pet.id, newStatus);
  }

  deletePet(pet: AdoptablePet, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm(`Tem certeza que deseja remover o anúncio de adoção de "${pet.name}"?`)) {
      this.registrationService.deleteAdoptablePet(pet.id);
    }
  }

  async restoreSeedPets(): Promise<void> {
    if (confirm('Deseja restaurar os 4 animais demonstrativos (Pipoca, Luna, Max e Belinha) no site e na nuvem?')) {
      await this.registrationService.restoreDefaultAdoptablePets();
      alert('🐾 Os 4 animais demonstrativos foram restaurados com sucesso e sincronizados na nuvem!');
    }
  }

  setTab(tab: 'adotar' | 'doar'): void {
    this.activeTab.set(tab);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  private compressAndSetPhoto(file: File, slot: 1 | 2 | 3): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 640;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.70);
          if (slot === 1) this.photoPreview1.set(compressed);
          else if (slot === 2) this.photoPreview2.set(compressed);
          else if (slot === 3) this.photoPreview3.set(compressed);
        } else {
          if (slot === 1) this.photoPreview1.set(e.target.result);
          else if (slot === 2) this.photoPreview2.set(e.target.result);
          else if (slot === 3) this.photoPreview3.set(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onFileSelected(event: Event, slot: 1 | 2 | 3 = 1): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.compressAndSetPhoto(file, slot);
    }
  }

  removePhoto(slot: 2 | 3, event?: Event): void {
    if (event) event.stopPropagation();
    if (slot === 2) {
      this.photoPreview2.set(null);
    } else if (slot === 3) {
      this.photoPreview3.set(null);
    }
  }

  openAdoptionModal(pet: AdoptablePet): void {
    this.selectedPetForAdoption.set(pet);
    this.adoptionInterestForm.reset({
      residenceType: 'Casa com Quintal Murado',
      hasOtherPets: false,
      agreeDirectContractTerms: false
    });
  }

  closeAdoptionModal(): void {
    this.selectedPetForAdoption.set(null);
  }

  openDetailsModal(pet: AdoptablePet): void {
    this.activeDetailsPhotoIndex.set(0);
    this.selectedPetForDetails.set(pet);
  }

  closeDetailsModal(): void {
    this.selectedPetForDetails.set(null);
  }

  getFormErrors(): string[] {
    const errors: string[] = [];
    const f = this.donationForm;

    if (f.get('donorName')?.invalid) errors.push('Nome Completo do Protetor (mínimo 3 letras)');
    if (f.get('donorCpf')?.invalid) errors.push('CPF do Protetor (mínimo 11 dígitos)');
    if (f.get('donorPhone')?.invalid) errors.push('WhatsApp de Contato Direto com DDD');
    if (f.get('donorEmail')?.invalid) errors.push('E-mail de Contato válido');
    if (f.get('neighborhood')?.invalid) errors.push('Bairro de acolhimento em Macaé');
    if (f.get('petName')?.invalid) errors.push('Nome do Animalzinho (mínimo 2 letras)');
    if (f.get('temperament')?.invalid) errors.push('Temperamento Resumido (mínimo 5 letras)');
    if (f.get('story')?.invalid) errors.push('História e Requisitos do Lar (mínimo 5 letras)');
    if (f.get('protectionDeclaration')?.invalid) errors.push('Declaração de Responsabilidade do Protetor (marcar caixinha obrigatória)');
    if (f.get('agreeTerms')?.invalid) errors.push('Termo de Doação Gratuita (marcar caixinha obrigatória)');

    return errors;
  }

  async submitDonation(): Promise<void> {
    this.formValidationErrors.set([]);

    if (this.donationForm.invalid) {
      this.donationForm.markAllAsTouched();
      const errs = this.getFormErrors();
      this.formValidationErrors.set(errs);

      setTimeout(() => {
        const firstInvalid = document.querySelector('.form-control.is-invalid, .form-textarea.is-invalid, .form-checkbox.ng-invalid, .alert-danger');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstInvalid as HTMLElement).focus?.();
        }
      }, 50);

      alert('Por favor, preencha os campos obrigatórios em destaque para publicar o anúncio:\n\n• ' + errs.join('\n• '));
      return;
    }

    this.isSubmitting.set(true);

    try {
      const val = this.donationForm.value;
      const additional = [this.photoPreview2(), this.photoPreview3()].filter(Boolean) as string[];

      const res = await this.registrationService.registerPetForDonation({
        name: val.petName,
        species: val.species,
        gender: val.gender,
        ageCategory: val.ageCategory,
        ageText: val.ageText,
        size: val.size,
        breed: val.breed,
        photoUrl: this.photoPreview1(),
        additionalPhotos: additional.length > 0 ? additional : [],
        isCastrated: val.isCastrated,
        isVaccinated: val.isVaccinated,
        isDewormed: val.isDewormed,
        isSpecialNeeds: val.isSpecialNeeds,
        aggressionHistory: val.aggressionHistory,
        temperament: val.temperament,
        story: val.story,
        donorName: val.donorName,
        donorCpf: val.donorCpf,
        donorPhone: val.donorPhone,
        donorEmail: val.donorEmail,
        donorType: val.donorType,
        city: val.city,
        neighborhood: val.neighborhood,
        protectionDeclaration: val.protectionDeclaration
      });

      this.submittedDonation.set(res.pet);
      this.photoPreview2.set(null);
      this.photoPreview3.set(null);

      if (res.success) {
        alert(`🐾 Parabéns! O anúncio de "${res.pet.name}" foi publicado com sucesso e sincronizado em tempo real com a nuvem do Google Firestore!\n\nEle já está visível para todos os visitantes em computadores, celulares e abas anônimas.`);
      } else {
        alert(`⚠️ Atenção: O anúncio de "${res.pet.name}" foi salvo neste navegador, mas não foi possível sincronizar com a nuvem do Google.\n\nSe você estiver utilizando o navegador Brave ou bloqueador de anúncios (AdBlock), desative os escudos de proteção para o site ongmaosquecuidam.com.br para permitir a sincronização.`);
      }

      this.donationForm.reset({
        species: 'Cão',
        gender: 'Macho',
        ageCategory: 'Adulto',
        ageText: '2 anos',
        size: 'Porte Médio',
        breed: 'Sem Raça Definida (SRD)',
        donorType: 'Protetor Independente',
        city: 'Macaé',
        isCastrated: true,
        isVaccinated: true,
        vaccineDetails: 'Vacinação V8/V10 e Antirrábica em dia',
        isDewormed: true,
        isSpecialNeeds: false,
        aggressionHistory: 'Sem histórico de agressividade (Dócil e sociável)',
        protectionDeclaration: false,
        agreeTerms: false
      });
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  submitAdoptionInterest(): void {
    if (this.adoptionInterestForm.invalid || !this.selectedPetForAdoption()) {
      this.adoptionInterestForm.markAllAsTouched();
      return;
    }

    const pet = this.selectedPetForAdoption()!;
    const val = this.adoptionInterestForm.value;

    const application = this.registrationService.registerAdoptionApplication({
      petId: pet.id,
      petName: pet.name,
      adopterName: val.adopterName,
      adopterEmail: val.adopterEmail,
      adopterPhone: val.adopterPhone,
      adopterCpf: val.adopterCpf,
      adopterAddress: val.adopterAddress,
      residenceType: val.residenceType,
      hasOtherPets: val.hasOtherPets,
      motivation: val.motivation
    });

    this.submittedApplication.set(application);
    this.contractPet.set(pet);
    this.contractAdopter.set(application);
    this.selectedPetForAdoption.set(null);
  }

  openDirectContract(pet: AdoptablePet | null, app: AdoptionApplication | null): void {
    if (pet && app) {
      this.contractPet.set(pet);
      this.contractAdopter.set(app);
      this.showContractModal.set(true);
    }
  }

  printContract(): void {
    window.print();
  }

  formatWhatsappLink(phone: string, petName: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullNumber = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    const message = encodeURIComponent(`Olá! Vi o anúncio de adoção do(a) ${petName} no Mural da ONG Mãos que Cuidam e gostaria de mais informações para combinarmos o Termo de Adoção Direto! ❤️🐾`);
    return `https://wa.me/${fullNumber}?text=${message}`;
  }
}
