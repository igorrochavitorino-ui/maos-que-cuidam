import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css']
})
export class DonateComponent {
  scrollToPix(): void {
    const el = document.getElementById('pix-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
