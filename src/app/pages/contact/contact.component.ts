import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  // Estado do formulário de contato
  name = '';
  email = '';
  phone = '';
  subject = 'Dúvida sobre os cursos de banho e tosa';
  message = '';
  submitted = signal<boolean>(false);

  // FAQ Accordion
  openFaqId = signal<number | null>(1);

  faqs = [
    {
      id: 1,
      question: 'Os cursos de Banho e Tosa são realmente 100% gratuitos?',
      answer: 'Sim! Nossas turmas para alunos de baixa renda são totalmente custeadas por nossos parceiros, patrocinadores e doações solidárias. Não cobramos mensalidade nem taxa de matrícula.'
    },
    {
      id: 2,
      question: 'Preciso ter experiência prévia com animais para me inscrever?',
      answer: 'Para a Formação Básica em Banho & Higienização não é necessário nenhuma experiência prévia, apenas amor, paciência e respeito aos animais. Para o curso de Especialização em Tosa Comercial na Tesoura, recomendamos ter feito o módulo básico ou já ter trabalhado como banhista.'
    },
    {
      id: 3,
      question: 'Como funciona o Banho Social para cães e gatos?',
      answer: 'O banho social é destinado a cães resgatados de abrigos parceiros ou a pets de famílias da comunidade que não possuem condições financeiras. As higienizações são feitas pelos alunos com total supervisão de tosadores profissionais e suporte veterinário, utilizando produtos de excelência.'
    },
    {
      id: 4,
      question: 'O certificado da ONG é válido para trabalhar em Pet Shops?',
      answer: 'Sim! Nosso certificado detalha a carga horária prática, técnicas aprendidas e procedimentos realizados. O mercado pet valoriza imensamente a capacitação prática e a sensibilidade de manejo que nossos formandos desenvolvem.'
    },
    {
      id: 5,
      question: 'Como posso me tornar um voluntário ou parceiro da ONG?',
      answer: 'Você pode se cadastrar diretamente na aba "Seja Voluntário" do nosso site. Buscamos tosadores, veterinários parceiros, auxiliares de manejo e pessoas para comunicação e apoio geral.'
    }
  ];

  toggleFaq(id: number): void {
    this.openFaqId.update(current => current === id ? null : id);
  }

  submitContact(): void {
    if (!this.name || !this.email || !this.message) return;
    this.submitted.set(true);
    setTimeout(() => {
      this.name = '';
      this.email = '';
      this.phone = '';
      this.message = '';
    }, 1000);
  }
}
