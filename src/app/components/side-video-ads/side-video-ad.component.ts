import { Component, Input, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationService } from '../../services/registration.service';
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

  isMuted = signal<boolean>(true);
  isPlaying = signal<boolean>(true);
  isMinimized = signal<boolean>(false);

  ad = computed<VideoAd | undefined>(() => {
    return this.registrationService.videoAds().find(a => a.position === this.position && a.active);
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
}
