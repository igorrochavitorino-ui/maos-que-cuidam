import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private readonly FONT_SCALE_KEY = 'mqc_font_scale';
  private readonly CONTRAST_KEY = 'mqc_high_contrast';

  fontSizeLevel = signal<number>(0); // -1: pequeno, 0: padrão, 1: grande, 2: extra grande
  isHighContrast = signal<boolean>(false);

  constructor() {
    this.restorePreferences();

    // Efeito reativo para aplicar classes no <body>
    effect(() => {
      const level = this.fontSizeLevel();
      const contrast = this.isHighContrast();

      if (typeof document !== 'undefined') {
        const body = document.body;
        const html = document.documentElement;

        // Limpa classes anteriores de tamanho
        body.classList.remove('font-scale-small', 'font-scale-medium', 'font-scale-large');
        if (level === 1) body.classList.add('font-scale-medium');
        if (level >= 2) body.classList.add('font-scale-large');
        if (level === -1) body.classList.add('font-scale-small');

        // Alto Contraste
        if (contrast) {
          html.classList.add('high-contrast-mode');
        } else {
          html.classList.remove('high-contrast-mode');
        }
      }
    });
  }

  increaseFont(): void {
    if (this.fontSizeLevel() < 2) {
      const next = this.fontSizeLevel() + 1;
      this.fontSizeLevel.set(next);
      this.savePreferences();
    }
  }

  decreaseFont(): void {
    if (this.fontSizeLevel() > -1) {
      const next = this.fontSizeLevel() - 1;
      this.fontSizeLevel.set(next);
      this.savePreferences();
    }
  }

  resetFont(): void {
    this.fontSizeLevel.set(0);
    this.savePreferences();
  }

  toggleHighContrast(): void {
    const next = !this.isHighContrast();
    this.isHighContrast.set(next);
    this.savePreferences();
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(this.FONT_SCALE_KEY, this.fontSizeLevel().toString());
      localStorage.setItem(this.CONTRAST_KEY, this.isHighContrast().toString());
    } catch (e) {
      console.warn('Erro ao salvar preferências de acessibilidade:', e);
    }
  }

  private restorePreferences(): void {
    try {
      const storedFont = localStorage.getItem(this.FONT_SCALE_KEY);
      if (storedFont !== null) {
        this.fontSizeLevel.set(parseInt(storedFont, 10));
      }

      const storedContrast = localStorage.getItem(this.CONTRAST_KEY);
      if (storedContrast !== null) {
        this.isHighContrast.set(storedContrast === 'true');
      }
    } catch (e) {
      console.warn('Erro ao restaurar acessibilidade:', e);
    }
  }
}
