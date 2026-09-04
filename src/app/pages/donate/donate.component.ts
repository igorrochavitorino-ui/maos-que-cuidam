import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PIX_QR_CODE_BASE64 } from './pix-data';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css']
})
export class DonateComponent {
  pixQrCodeUrl = signal<string>(PIX_QR_CODE_BASE64);
  showZoomModal = signal<boolean>(false);

  scrollToPix(): void {
    const el = document.getElementById('pix-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleZoomModal(open: boolean): void {
    this.showZoomModal.set(open);
  }
}
