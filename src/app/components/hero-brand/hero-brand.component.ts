import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-brand',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-brand.component.html',
  styleUrls: ['./hero-brand.component.css']
})
export class HeroBrandComponent {}
