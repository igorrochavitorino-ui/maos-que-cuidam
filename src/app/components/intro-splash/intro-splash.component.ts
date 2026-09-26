import { Component, HostListener, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-splash.component.html',
  styleUrls: ['./intro-splash.component.css']
})
export class IntroSplashComponent implements AfterViewInit, OnDestroy {
  @ViewChild('introVideo') videoRef?: ElementRef<HTMLVideoElement>;

  isVisible = signal(true);
  isFadingOut = signal(false);
  private canDismissByGesture = false;

  constructor() {
    // Bloqueia a rolagem da página enquanto a introdução estiver ativa
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Dá uma folga de 1 segundo para garantir que o carregamento da página não feche a intro
    setTimeout(() => {
      this.canDismissByGesture = true;
    }, 1000);
  }

  ngAfterViewInit() {
    // Força o início do vídeo caso o autoplay nativo hesite
    if (this.videoRef?.nativeElement) {
      const v = this.videoRef.nativeElement;
      v.muted = true;
      v.play().catch(err => {
        console.warn('Autoplay bloqueado pelo navegador:', err);
      });
    }
  }

  // Fecha ao girar a roda do mouse (wheel)
  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!this.canDismissByGesture) return;
    if (Math.abs(event.deltaY) > 15) {
      this.closeIntro();
    }
  }

  // Fecha ao arrastar o dedo na tela do celular (touchmove)
  @HostListener('window:touchmove', ['$event'])
  onTouchMove() {
    if (!this.canDismissByGesture) return;
    this.closeIntro();
  }

  // Fecha quando o vídeo chega ao final
  onVideoEnded() {
    this.closeIntro();
  }

  closeIntro() {
    if (!this.isVisible() || this.isFadingOut()) return;
    this.isFadingOut.set(true);
    
    // Libera a rolagem da página de volta
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    setTimeout(() => {
      this.isVisible.set(false);
    }, 600); // tempo da transição de opacidade em CSS
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
