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
  isMuted = signal(true);
  private canDismissByGesture = false;
  private touchStartY = 0;

  constructor() {
    // Bloqueia a rolagem da página enquanto a introdução estiver ativa
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Dá uma folga de 1.2 segundos para garantir que o toque/carregamento inicial não feche a intro
    setTimeout(() => {
      this.canDismissByGesture = true;
    }, 1200);
  }

  ngAfterViewInit() {
    if (this.videoRef?.nativeElement) {
      const v = this.videoRef.nativeElement;
      v.muted = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('x5-playsinline', 'true');

      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // No iOS/Android, caso o modo de economia de energia bloqueie o autoplay silencioso,
          // dispara na primeira interação do usuário na tela
          const retryPlay = () => {
            v.play();
            document.removeEventListener('touchstart', retryPlay);
            document.removeEventListener('click', retryPlay);
          };
          document.addEventListener('touchstart', retryPlay, { once: true, passive: true });
          document.addEventListener('click', retryPlay, { once: true });
        });
      }
    }
  }

  // Alterna som ligado/desligado
  toggleSound(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (this.videoRef?.nativeElement) {
      const v = this.videoRef.nativeElement;
      v.muted = !v.muted;
      this.isMuted.set(v.muted);
    }
  }

  // Clique na tela ativa o som se estiver mudo
  onOverlayClick() {
    if (this.isMuted() && this.videoRef?.nativeElement) {
      this.toggleSound();
    }
  }

  // Fecha ao girar a roda do mouse (wheel)
  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!this.canDismissByGesture) return;
    if (Math.abs(event.deltaY) > 20) {
      this.closeIntro();
    }
  }

  // No celular: registra onde o toque começou
  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (event.touches && event.touches.length > 0) {
      this.touchStartY = event.touches[0].clientY;
    }
  }

  // No celular: só fecha se houver um arrasto intencional de pelo menos 50px
  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.canDismissByGesture) return;
    if (event.touches && event.touches.length > 0) {
      const currentY = event.touches[0].clientY;
      const deltaY = Math.abs(currentY - this.touchStartY);
      if (deltaY > 50) {
        this.closeIntro();
      }
    }
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
