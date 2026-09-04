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
    story: ['', [Validators.required, Validators.minLength(20)]],
    
    // Declaração de Responsabilidade do Protetor Original
    protectionDeclaration: [false, Validators.requiredTrue],
    agreeTerms: [false, Validators.requiredTrue]
  });

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

  setTab(tab: 'adotar' | 'doar'): void {
    this.activeTab.set(tab);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  onFileSelected(event: Event, slot: 1 | 2 | 3 = 1): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (slot === 1) {
          this.photoPreview1.set(e.target.result);
        } else if (slot === 2) {
          this.photoPreview2.set(e.target.result);
        } else if (slot === 3) {
          this.photoPreview3.set(e.target.result);
        }
      };
      reader.readAsDataURL(file);
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

  submitDonation(): void {
    if (this.donationForm.invalid) {
      this.donationForm.markAllAsTouched();
      return;
    }

    const val = this.donationForm.value;
    const additional = [this.photoPreview2(), this.photoPreview3()].filter(Boolean) as string[];

    const created = this.registrationService.registerPetForDonation({
      name: val.petName,
      species: val.species,
      gender: val.gender,
      ageCategory: val.ageCategory,
      ageText: val.ageText,
      size: val.size,
      breed: val.breed,
      photoUrl: this.photoPreview1(),
      additionalPhotos: additional.length > 0 ? additional : undefined,
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

    this.submittedDonation.set(created);
    this.photoPreview2.set(null);
    this.photoPreview3.set(null);
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
