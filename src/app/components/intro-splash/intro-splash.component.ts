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
  isPaused = signal(false);
  private canDismissByGesture = false;
  private touchStartY = 0;

  constructor() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Proteção de 1.8s no carregamento inicial para nunca fechar sozinho
    setTimeout(() => {
      this.canDismissByGesture = true;
    }, 1800);
  }

  ngAfterViewInit() {
    if (this.videoRef?.nativeElement) {
      const v = this.videoRef.nativeElement;
      v.muted = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('x5-playsinline', 'true');

      // Escuta eventos do vídeo
      v.onplaying = () => this.isPaused.set(false);
      v.onpause = () => {
        if (this.isVisible() && !this.isFadingOut() && v.currentTime < (v.duration - 0.5)) {
          this.isPaused.set(true);
        }
      };

      // Tenta iniciar o vídeo silencioso
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPaused.set(false);
          })
          .catch(() => {
            // Em navegadores móveis como Brave ou iPhone em economia de bateria que bloqueiam autoplay
            this.isPaused.set(true);
          });
      }
    }
  }

  // Acionado quando o usuário toca no botão de Play ou na tela pausada
  playVideo(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (this.videoRef?.nativeElement) {
      const v = this.videoRef.nativeElement;
      // Como o usuário tocou intencionalmente, podemos tentar com som!
      v.muted = false;
      this.isMuted.set(false);
      v.play()
        .then(() => {
          this.isPaused.set(false);
        })
        .catch(() => {
          // Se o navegador ainda exigir mudo
          v.muted = true;
          this.isMuted.set(true);
          v.play().then(() => this.isPaused.set(false));
        });
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

  // Clique na tela
  onOverlayClick() {
    if (this.isPaused()) {
      this.playVideo();
      return;
    }
    if (this.isMuted() && this.videoRef?.nativeElement) {
      this.toggleSound();
    }
  }

  // Fecha ao girar a roda do mouse (wheel no PC)
  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!this.canDismissByGesture) return;
    if (Math.abs(event.deltaY) > 25) {
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

  @HostListener('window:touchend', ['$event'])
  onTouchEnd() {
    this.touchStartY = 0;
  }

  // No celular: só fecha se houver um arrasto intencional de mais de 70px
  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.canDismissByGesture || !this.touchStartY) return;
    if (event.touches && event.touches.length > 0) {
      const currentY = event.touches[0].clientY;
      const deltaY = Math.abs(currentY - this.touchStartY);
      if (deltaY > 70) {
        this.closeIntro();
      }
    }
  }

  // Fecha quando o vídeo realmente termina
  onVideoEnded() {
    if (this.videoRef?.nativeElement && this.videoRef.nativeElement.currentTime > 2) {
      this.closeIntro();
    }
  }

  closeIntro() {
    if (!this.isVisible() || this.isFadingOut()) return;
    this.isFadingOut.set(true);
    
    // Libera a rolagem da página
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    setTimeout(() => {
      this.isVisible.set(false);
    }, 600); // transição suave de opacidade
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
