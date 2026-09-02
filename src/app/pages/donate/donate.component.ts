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
  pixKey = 'contato@maosquecuidam.org.br';
  pixCopiaECola = '00020126580014br.gov.bcb.pix0136contato@maosquecuidam.org.br5204000053039865802BR5925ONG MAOS QUE CUIDAM6009SAO PAULO62070503***6304E8A2';
  
  copied = signal<boolean>(false);
  selectedTier = signal<number | null>(null);

  copyPixKey(): void {
    navigator.clipboard.writeText(this.pixKey).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 3000);
    });
  }

  selectTier(amount: number): void {
    this.selectedTier.set(amount);
  }

  donationKits = [
    {
      id: 1,
      title: 'Kit Cosméticos Pet',
      amount: 45,
      desc: 'Garante shampoos neutros, condicionador e algodão para ouvidos de 10 animais em aula.',
      icon: '🧼'
    },
    {
      id: 2,
      title: 'Kit Tesouras & Lâminas',
      amount: 90,
      desc: 'Ajuda na afiação de lâminas profissionais e reposição de tesouras para alunos.',
      icon: '✂️',
      popular: true
    },
    {
      id: 3,
      title: 'Apadrinhe 1 Aluno',
      amount: 180,
      desc: 'Cobre todo o material didático, uniforme e insumos práticos de 1 aluno durante todo o curso.',
      icon: '🎓',
      badge: 'Maior Impacto Social'
    },
    {
      id: 4,
      title: 'Manutenção do Espaço',
      amount: 350,
      desc: 'Contribui com água, energia do laboratório e equipamentos de secagem e proteção.',
      icon: '🏢'
    }
  ];
}
