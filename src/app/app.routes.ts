import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { DonateComponent } from './pages/donate/donate.component';
import { ContactComponent } from './pages/contact/contact.component';
import { SponsorsComponent } from './pages/sponsors/sponsors.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { AdoptionComponent } from './pages/adoption/adoption.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Início | ONG Mãos que Cuidam' },
  { path: 'cursos', component: CoursesComponent, title: 'Cursos de Banho e Tosa | ONG Mãos que Cuidam' },
  { path: 'adocao', component: AdoptionComponent, title: 'Adoção & Doação de Animais | ONG Mãos que Cuidam' },
  { path: 'adotar', redirectTo: 'adocao' },
  { path: 'transformacoes', component: GalleryComponent, title: 'Galeria & Banho Gratuito | ONG Mãos que Cuidam' },
  { path: 'galeria-pets', redirectTo: 'transformacoes' },
  { path: 'cadastro', component: RegistrationComponent, title: 'Inscrições & Cadastro | ONG Mãos que Cuidam' },
  { path: 'patrocinadores', component: SponsorsComponent, title: 'Patrocinadores & Parceiros | ONG Mãos que Cuidam' },
  { path: 'admin', component: AdminPanelComponent, title: 'Painel de Gestão | ONG Mãos que Cuidam' },
  { path: 'doar', component: DonateComponent, title: 'Como Ajudar & Doações | ONG Mãos que Cuidam' },
  { path: 'contato', component: ContactComponent, title: 'Contato & FAQ | ONG Mãos que Cuidam' },
  { path: '**', redirectTo: '' }
];
