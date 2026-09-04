import { Component, Input, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { VideoAd } from '../../models/registration.model';

@Component({
  selector: 'app-side-video-ad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-video-ad.component.html',
  styleUrls: ['./side-video-ad.component.css']
})
export class SideVideoAdComponent implements AfterViewInit {
  @Input({ required: true }) position!: 'left' | 'right';
  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;

  registrationService = inject(RegistrationService);
  authService = inject(AuthService);
  router = inject(Router);

  isMuted = signal<boolean>(true);
  isPlaying = signal<boolean>(true);
  isMinimized = signal<boolean>(false);
  currentIndex = signal<number>(0);

  activeAds = computed<VideoAd[]>(() => {
    return this.registrationService.videoAds().filter(a => a.position === this.position && a.active);
  });

  ad = computed<VideoAd | undefined>(() => {
    const list = this.activeAds();
    if (list.length === 0) return undefined;
    const idx = Math.abs(this.currentIndex()) % list.length;
    return list[idx];
  });

  ngAfterViewInit(): void {
    this.initVideo();
  }

  initVideo(): void {
    if (this.videoPlayerRef && this.videoPlayerRef.nativeElement) {
      const vid = this.videoPlayerRef.nativeElement;
      vid.muted = true;
      vid.play().catch(() => {
        // Autoplay may be restricted by browser until interaction
        this.isPlaying.set(false);
      });
    }
  }

  nextAd(event?: Event): void {
    if (event) event.stopPropagation();
    const list = this.activeAds();
    if (list.length > 1) {
      this.currentIndex.update(idx => (idx + 1) % list.length);
      setTimeout(() => this.initVideo(), 50);
    }
  }

  prevAd(event?: Event): void {
    if (event) event.stopPropagation();
    const list = this.activeAds();
    if (list.length > 1) {
      this.currentIndex.update(idx => (idx - 1 + list.length) % list.length);
      setTimeout(() => this.initVideo(), 50);
    }
  }

  toggleMute(event: Event): void {
    event.stopPropagation();
    if (this.videoPlayerRef && this.videoPlayerRef.nativeElement) {
      const vid = this.videoPlayerRef.nativeElement;
      vid.muted = !vid.muted;
      this.isMuted.set(vid.muted);
    }
  }

  togglePlay(event: Event): void {
    event.stopPropagation();
    if (this.videoPlayerRef && this.videoPlayerRef.nativeElement) {
      const vid = this.videoPlayerRef.nativeElement;
      if (vid.paused) {
        vid.play();
        this.isPlaying.set(true);
      } else {
        vid.pause();
        this.isPlaying.set(false);
      }
    }
  }

  toggleMinimize(event?: Event): void {
    if (event) event.stopPropagation();
    this.isMinimized.set(!this.isMinimized());
  }

  openAdLink(url: string, event: Event): void {
    event.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  }

  goToAdminAds(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/admin'], { queryParams: { tab: 'videoAds' } });
  }

  deleteCurrentAd(event: Event): void {
    event.stopPropagation();
    const currentAd = this.ad();
    if (!currentAd) return;
    if (confirm(`Deseja realmente excluir a propaganda de "${currentAd.sponsorName}" (${currentAd.title})?`)) {
      this.registrationService.deleteVideoAd(currentAd.id);
    }
  }
}
