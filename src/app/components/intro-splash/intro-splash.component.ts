import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-splash.component.html',
  styleUrls: ['./intro-splash.component.css']
})
export class IntroSplashComponent {
  isVisible = signal(true);
  isFadingOut = signal(false);

  // Fecha ao rolar a página ou rodar a roda do mouse
  @HostListener('window:wheel', ['$event'])
  @HostListener('window:scroll', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onUserScroll() {
    this.closeIntro();
  }

  // Fecha quando o vídeo chega ao final
  onVideoEnded() {
    this.closeIntro();
  }

  closeIntro() {
    if (!this.isVisible() || this.isFadingOut()) return;
    this.isFadingOut.set(true);
    setTimeout(() => {
      this.isVisible.set(false);
    }, 600); // tempo da transição de opacidade em CSS
  }
}
