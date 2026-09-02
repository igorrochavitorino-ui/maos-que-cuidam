import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
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

  sponsors: Sponsor[] = this.registrationService.getSponsors();
  selectedCategory = signal<string>('all');
  submittedProposal = signal<SponsorProposal | null>(null);

  proposalForm: FormGroup = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(3)]],
    representativeName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    tierInterest: ['Cota Diamante (Mantenedor Master)', Validators.required],
    proposalMessage: ['', [Validators.required, Validators.minLength(15)]]
  });

  filterCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  get filteredSponsors(): Sponsor[] {
    const c = this.selectedCategory();
    if (c === 'all') return this.sponsors;
    return this.sponsors.filter(s => s.category === c);
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
      tierInterest: 'Cota Diamante (Mantenedor Master)'
    });
  }

  resetProposal(): void {
    this.submittedProposal.set(null);
  }
}
