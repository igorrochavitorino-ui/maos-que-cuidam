import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { Course, Testimonial } from '../../models/registration.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  registrationService = inject(RegistrationService);

  courses: Course[] = this.registrationService.getCourses();
  testimonials: Testimonial[] = this.registrationService.getTestimonials();

  // Dados de impacto
  stats = [
    { number: '+520', label: 'Alunos Capacitados', sublabel: 'com formação prática de excelência', icon: 'graduation' },
    { number: '+2.850', label: 'Banhos & Tosas Sociais', sublabel: 'em cães resgatados e de famílias carentes', icon: 'paw' },
    { number: '94%', label: 'Índice de Inserção', sublabel: 'trabalhando ou com negócio próprio', icon: 'trending' },
    { number: '100%', label: 'Gratuito & Social', sublabel: 'sem custos para alunos de baixa renda', icon: 'heart' }
  ];

  // Pilares
  pillars = [
    {
      title: 'Amor',
      tagline: 'Manejo Positivo e Acolhedor',
      desc: 'Ensinamos técnicas humanizadas de atendimento. Nenhum animal passa por estresse ou força física durante os procedimentos de banho e tosa.',
      icon: 'heart'
    },
    {
      title: 'Respeito',
      tagline: 'Oportunidade & Dignidade Humana',
      desc: 'Capacitamos pessoas em busca de emprego, jovens e mulheres chefes de família para conquistarem sua independência financeira com uma profissão digna.',
      icon: 'hands'
    },
    {
      title: 'Proteção',
      tagline: 'Cuidado & Saúde Preventiva',
      desc: 'Detectamos precocemente alterações na pele, ouvidos e olhos dos animais durante o banho, auxiliando na saúde integral dos pets da comunidade.',
      icon: 'shield'
    }
  ];
}
