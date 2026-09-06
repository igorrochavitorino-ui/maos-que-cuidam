import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SideVideoAdComponent } from './components/side-video-ads/side-video-ad.component';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, SideVideoAdComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Mãos que Cuidam';
  // Inicializa o serviço de rastreamento de acessos do site
  private analyticsService = inject(AnalyticsService);

  // Controle do balão de atendimento do WhatsApp
  showWhatsappTooltip = signal(true);

  constructor() {
    // Recolhe o balão de ajuda após 7 segundos para não poluir a tela
    setTimeout(() => {
      this.showWhatsappTooltip.set(false);
    }, 7000);
  }

  dismissTooltip(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.showWhatsappTooltip.set(false);
  }
}


