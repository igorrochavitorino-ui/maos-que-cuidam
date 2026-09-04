import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { Sponsor, SponsorProposal } from '../../models/registration.model';

@Component({
  selector: 'app-sponsors',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.css']
})
export class SponsorsComponent {
  private fb = inject(FormBuilder);
  registrationService = inject(RegistrationService);
  authService = inject(AuthService);

  sponsors = computed(() => this.registrationService.sponsors());
  submittedProposal = signal<SponsorProposal | null>(null);

  // Estados dos Modais de Patrocinador
  showAddSponsorModal = signal<boolean>(false);
  showQuickLoginModal = signal<boolean>(false);
  editingSponsorId = signal<string | null>(null);
  toastMessage = signal<string | null>(null);

  loginEmail = signal<string>('admin@maosquecuidam.org.br');
  loginPassword = signal<string>('admin');
  loginError = signal<string | null>(null);

  logoPreview = signal<string>('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gp" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f472b6"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23fdf2f8"/><circle cx="50" cy="50" r="30" fill="url(%23gp)"/><path d="M42 38c-3 0-5 2-5 5 0 6 13 18 13 18s13-12 13-18c0-3-2-5-5-5-3 0-6 3-8 6-2-3-5-6-8-6z" fill="%23ffffff"/></svg>');

  // Formulário de Cadastro / Edição de Patrocinador
  sponsorForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['Diamante', Validators.required],
    badgeLabel: ['⭐ Apoiador Oficial', Validators.required],
    tagline: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(15)]],
    contributionType: [''],
    logoUrl: [''],
    websiteUrl: [''],
    studentsSupported: [150]
  });

  // Formulário de Proposta Comercial de Empresas
  proposalForm: FormGroup = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(3)]],
    representativeName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    tierInterest: ['Doação de Insumos / Cosméticos', Validators.required],
    proposalMessage: ['', [Validators.required, Validators.minLength(15)]]
  });

  handleOpenAddSponsor(): void {
    if (this.authService.isAuthenticated()) {
      this.editingSponsorId.set(null);
      this.sponsorForm.reset({
        category: 'Diamante',
        badgeLabel: '⭐ Apoiador Oficial',
        contributionType: '',
        websiteUrl: '',
        studentsSupported: 150
      });
      this.showAddSponsorModal.set(true);
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
      this.handleOpenAddSponsor();
    } else {
      this.loginError.set(res.message);
    }
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  openEditSponsor(sp: Sponsor): void {
    this.editingSponsorId.set(sp.id);
    this.logoPreview.set(sp.logoUrl);
    this.sponsorForm.patchValue({
      name: sp.name,
      category: sp.category,
      badgeLabel: sp.badgeLabel || '⭐ Apoiador Oficial',
      tagline: sp.tagline,
      description: sp.description,
      contributionType: sp.contributionType || '',
      logoUrl: sp.logoUrl.startsWith('data:') ? '' : sp.logoUrl,
      websiteUrl: sp.websiteUrl || '',
      studentsSupported: sp.studentsSupported || 150
    });
    this.showAddSponsorModal.set(true);
  }

  saveSponsor(): void {
    if (this.sponsorForm.invalid) {
      this.sponsorForm.markAllAsTouched();
      return;
    }

    const val = this.sponsorForm.value;
    const finalLogo = val.logoUrl?.trim() || this.logoPreview();
    const finalWebsite = val.websiteUrl?.trim() || '';
    const finalContribution = val.contributionType?.trim() || '';

    if (this.editingSponsorId()) {
      this.registrationService.updateSponsor(this.editingSponsorId()!, {
        name: val.name,
        category: val.category,
        badgeLabel: val.badgeLabel,
        tagline: val.tagline,
        description: val.description,
        contributionType: finalContribution,
        logoUrl: finalLogo,
        websiteUrl: finalWebsite,
        studentsSupported: val.studentsSupported
      });
      this.showToast(`✨ Empresa "${val.name}" atualizada com sucesso!`);
    } else {
      this.registrationService.addSponsor({
        name: val.name,
        category: val.category,
        badgeLabel: val.badgeLabel,
        tagline: val.tagline,
        description: val.description,
        contributionType: finalContribution,
        logoUrl: finalLogo,
        websiteUrl: finalWebsite,
        studentsSupported: val.studentsSupported
      });
      this.showToast(`🎉 Nova Empresa "${val.name}" cadastrada com sucesso!`);
    }

    this.showAddSponsorModal.set(false);
    this.editingSponsorId.set(null);
  }

  deleteSponsor(id: string, name: string): void {
    if (confirm(`Deseja realmente remover o patrocinador "${name}" da lista oficial?`)) {
      this.registrationService.deleteSponsor(id);
      this.showToast(`Empresa "${name}" removida com sucesso.`);
    }
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  submitProposal(): void {
    if (this.proposalForm.invalid) {
      this.proposalForm.markAllAsTouched();
      return;
    }

    const val = this.proposalForm.value;
    const created = this.registrationService.registerSponsorProposal({
      companyName: val.companyName,
      representativeName: val.representativeName,
      email: val.email,
      phone: val.phone,
      tierInterest: val.tierInterest,
      proposalMessage: val.proposalMessage
    });

    this.submittedProposal.set(created);
    this.proposalForm.reset({
      tierInterest: 'Doação de Insumos / Cosméticos'
    });
  }

  resetProposal(): void {
    this.submittedProposal.set(null);
  }
}
