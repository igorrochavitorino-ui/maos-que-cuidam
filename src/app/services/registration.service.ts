import { Injectable, signal, computed, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { 
  Course, 
  StudentRegistration, 
  VolunteerRegistration, 
  PetRegistration, 
  Testimonial, 
  Sponsor, 
  SponsorProposal, 
  PetGalleryItem, 
  AdoptablePet, 
  AdoptionApplication, 
  RegistrationStatus,
  ImpactStat,
  VideoAd
} from '../models/registration.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private firebaseService = inject(FirebaseService);
  private notificationService = inject(NotificationService);

  private readonly STUDENTS_KEY = 'mqc_students_data';
  private readonly VOLUNTEERS_KEY = 'mqc_volunteers_data';
  private readonly PETS_KEY = 'mqc_pets_data';
  private readonly SPONSOR_PROPOSALS_KEY = 'mqc_sponsor_proposals_data';
  private readonly GALLERY_KEY = 'mqc_gallery_data';
  private readonly ADOPTABLE_PETS_KEY = 'mqc_adoptable_pets_data';
  private readonly ADOPTION_APPLICATIONS_KEY = 'mqc_adoption_applications_data';
  private readonly SPONSORS_KEY = 'mqc_sponsors_data';
  private readonly TESTIMONIALS_KEY = 'mqc_testimonials_data';
  private readonly IMPACT_STATS_KEY = 'mqc_impact_stats_data';
  private readonly VIDEO_ADS_KEY = 'mqc_video_ads_data';

  // Signals para reatividade pura
  private studentsSignal = signal<StudentRegistration[]>([]);
  private volunteersSignal = signal<VolunteerRegistration[]>([]);
  private petsSignal = signal<PetRegistration[]>([]);
  private sponsorProposalsSignal = signal<SponsorProposal[]>([]);
  private gallerySignal = signal<PetGalleryItem[]>([]);
  private adoptablePetsSignal = signal<AdoptablePet[]>([]);
  private adoptionApplicationsSignal = signal<AdoptionApplication[]>([]);
  private sponsorsSignal = signal<Sponsor[]>([]);
  private testimonialsSignal = signal<Testimonial[]>([]);
  private impactStatsSignal = signal<ImpactStat[]>([]);
  private videoAdsSignal = signal<VideoAd[]>([]);

  // Computed signals
  readonly students = computed(() => this.studentsSignal());
  readonly volunteers = computed(() => this.volunteersSignal());
  readonly pets = computed(() => this.petsSignal());
  readonly sponsorProposals = computed(() => this.sponsorProposalsSignal());
  readonly galleryItems = computed(() => this.gallerySignal());
  readonly adoptablePets = computed(() => this.adoptablePetsSignal());
  readonly adoptionApplications = computed(() => this.adoptionApplicationsSignal());
  readonly sponsors = computed(() => this.sponsorsSignal());
  readonly testimonials = computed(() => this.testimonialsSignal());
  readonly impactStats = computed(() => this.impactStatsSignal());
  readonly videoAds = computed(() => this.videoAdsSignal());

  readonly totalStudents = computed(() => this.studentsSignal().length);
  readonly totalVolunteers = computed(() => this.volunteersSignal().length);
  readonly totalPets = computed(() => this.petsSignal().length);
  readonly totalProposals = computed(() => this.sponsorProposalsSignal().length);
  readonly totalGalleryPets = computed(() => this.gallerySignal().length);
  readonly totalAdoptablePets = computed(() => this.adoptablePetsSignal().length);
  readonly totalAdoptionApplications = computed(() => this.adoptionApplicationsSignal().length);
  readonly totalSponsors = computed(() => this.sponsorsSignal().length);
  readonly totalTestimonials = computed(() => this.testimonialsSignal().length);

  // Lista oficial de cursos da ONG Mãos que Cuidam
  private readonly coursesList: Course[] = [
    {
      id: 'curso-banho-higienizacao',
      title: 'Formação Básica em Banho & Higienização Pet',
      tagline: 'O ponto de partida essencial para cuidar de cães e gatos com amor, técnica e segurança.',
      shortDescription: 'Domine técnicas de manejo positivo sem estresse, secagem correta, corte de unhas, limpeza auricular e produtos adequados para cada pelagem.',
      fullDescription: 'Este curso prepara o aluno para os fundamentos da rotina de higienização pet, focando no bem-estar animal, redução de estresse e domínio técnico das principais etapas do banho comercial e de abrigo.',
      durationHours: 60,
      durationWeeks: 4,
      modality: 'Presencial Prático',
      level: 'Iniciante',
      scheduleOptions: ['Tarde (13:00 às 17:00)', 'Noite (18:00 às 22:00)', 'Sábados (08h às 15h)'],
      prerequisites: 'Idade mínima de 16 anos e amor pelos animais. Não requer experiência anterior.',
      certificateIncluded: true,
      maxStudentsPerClass: 10,
      icon: 'bath',
      badge: 'Mais Procurado',
      highlighted: true,
      modules: [
        {
          title: 'Módulo 1: Introdução, História & Mercado Profissional',
          topics: [
            '1. Introdução ao banho e tosa',
            '2. Postura Profissional',
            '3. Origem do banho e tosa',
            '4. Surgimento da Profissão',
            '5. Lei que trata os maus tratos no Brasil',
            '6. Mercado Pet 2025'
          ]
        },
        {
          title: 'Módulo 2: Ética, Legislação & Anatomia Animal',
          topics: [
            '7. Ética, deveres e obrigações',
            '8. Responsabilidade civil',
            '9. Anatomia Simples',
            '10. Unhas',
            '11. Orelhas',
            '12. Raças e tipos de pelagens'
          ]
        },
        {
          title: 'Módulo 3: Equipamentos, Segurança & Saúde Pet',
          topics: [
            '13. Ferramentas e equipamentos',
            '14. Diferença entre as tesouras',
            '15. Acidentes e segurança',
            '16. Parasitas',
            '17. Anamnese'
          ]
        },
        {
          title: 'Módulo 4: Prática Completa de Banho & Tosa',
          topics: [
            '18. Banho',
            '19. Tosa higiênica',
            '20. Tosa'
          ]
        }
      ]
    },
    {
      id: 'curso-tosa-comercial-tesoura',
      title: 'Especialização em Tosa Comercial',
      tagline: 'Eleve o padrão do seu trabalho com tosas modernas, tosa bebê e acabamento perfeito.',
      shortDescription: 'Aprenda tosa higiênica, tosa padrão da máquina, tosa bebê em Spitz e Poodle, além do domínio de tesouras retas, curvas e tubarão.',
      fullDescription: 'Capacitação prática avançada para quem deseja atuar no mercado de trabalho ou abrir seu próprio negócio de banho e tosa, priorizando estética e conforto ao animal.',
      durationHours: 8,
      durationWeeks: 1,
      modality: 'Presencial Prático',
      level: 'Intermediário',
      scheduleOptions: ['Tarde (13:00 às 17:00)', 'Noite (18:00 às 22:00)', 'Sábados (08h às 15h)'],
      prerequisites: 'Curso básico de banho e higienização ou experiência prévia comprovada na área.',
      certificateIncluded: true,
      maxStudentsPerClass: 10,
      icon: 'scissors',
      badge: 'Alta Empregabilidade',
      highlighted: true,
      modules: [
        {
          title: 'Módulo 1: Equipamentos e Afiação',
          topics: ['Tipos de lâminas (10, 7F, 4F, etc.) e manutenção de máquinas', 'Tesouras retas, curvas, desbastadeiras e tubarão', 'Ergonomia do tosador']
        },
        {
          title: 'Módulo 2: Tosa Higiênica Completa',
          topics: ['Região íntima, perianal, almofadas plantares e abdômen', 'Proteção de áreas sensíveis', 'Padronização rápida e segura']
        },
        {
          title: 'Módulo 3: Tosas Comerciais e Tosa Bebê',
          topics: ['Tosa bebê em Shih Tzu, Lhasa Apso e Yorkshire', 'Desenho de rostos redondos e orelhas modeladas', 'Tosa em cães de pelagem dupla (Spitz/Lulu)']
        },
        {
          title: 'Módulo 4: Escultura e Acabamento na Tesoura',
          topics: ['Alinhamento de patas e saias na tesoura reta', 'Transições perfeitas com tesoura semi-dentada', 'Simetria e velocidade com perfeição']
        }
      ]
    },
    {
      id: 'workshop-primeiros-socorros-bem-estar',
      title: 'Workshop de Primeiros Socorros & Bem-Estar Pet',
      tagline: 'Capacitação essencial para identificar emergências e promover a saúde física e emocional.',
      shortDescription: 'Identificação de problemas dermatológicos, primeiros socorros em engasgos ou quedas de pressão, e cuidados especiais com filhotes e cães idosos.',
      fullDescription: 'Capacita profissionais e protetores a agir com rapidez e segurança diante de imprevistos do dia a dia nos atendimentos.',
      durationHours: 8,
      durationWeeks: 1,
      modality: 'Workshop',
      level: 'Todos os Níveis',
      scheduleOptions: ['Tarde (13:00 às 17:00)', 'Noite (18:00 às 22:00)', 'Sábados (08h às 15h)'],
      prerequisites: 'Aberto ao público em geral, tutores e profissionais pet.',
      certificateIncluded: true,
      maxStudentsPerClass: 20,
      icon: 'heart-pulse',
      badge: 'Certificado Especial',
      highlighted: false,
      modules: [
        {
          title: 'Módulo 1: Sinais Vitais & Identificação de Risco',
          topics: ['Frequência cardíaca, respiratória e temperatura', 'Avaliação de mucosas e hidratação', 'Choque anafilático e reações alérgicas']
        },
        {
          title: 'Módulo 2: Procedimentos de Primeiros Socorros',
          topics: ['Manobra de desengasgo (Heimlich canina)', 'Estancamento de pequenos sangramentos', 'Cuidados na insolação e hipotermia']
        },
        {
          title: 'Módulo 3: Cuidados Especiais e Dermatologia',
          topics: ['Identificação prévia de fungos, sarnas e ectoparasitas', 'Manejo de pets geriátricos com artrite', 'Comunicação assertiva com o tutor']
        }
      ]
    },
    {
      id: 'curso-empreendedorismo-pet',
      title: 'Empreendedorismo Pet & Atendimento com Amor',
      tagline: 'Aprenda a montar seu Pet Móvel, Pet Shop de Bairro ou trabalhar de forma autônoma.',
      shortDescription: 'Como precificar seus serviços, planejar compras de insumos, divulgar nas redes sociais e criar um atendimento humanizado e fidelizador.',
      fullDescription: 'Ideal para os alunos da ONG que desejam transformar a paixão por animais em sua fonte de renda sustentável, com noções práticas de finanças, MEI e marketing.',
      durationHours: 8,
      durationWeeks: 1,
      modality: 'Intensivo',
      level: 'Iniciante',
      scheduleOptions: ['Tarde (13:00 às 17:00)', 'Noite (18:00 às 22:00)', 'Sábados (08h às 15h)'],
      prerequisites: 'Desejo de empreender na área pet.',
      certificateIncluded: true,
      maxStudentsPerClass: 25,
      icon: 'briefcase',
      badge: 'Social & Empreendedor',
      highlighted: false,
      modules: [
        {
          title: 'Módulo 1: Planejamento & Formalização',
          topics: ['Abertura de MEI no setor pet', 'Equipamentos básicos para início de baixo custo', 'Custos fixos, variáveis e precificação']
        },
        {
          title: 'Módulo 2: Marketing & Encantamento do Cliente',
          topics: ['Fotografia pet para redes sociais', 'Atendimento humanizado e pós-atendimento', 'Fidelização através do carinho e respeito']
        }
      ]
    }
  ];

  // Grandes Patrocinadores Oficiais do Setor Pet
  private getSeedSponsors(): Sponsor[] {
    return [
      {
        id: 'sp-groomerpro',
        name: 'GroomerPro Cosméticos & Spa Pet',
        category: 'Diamante',
        badgeLabel: '⭐ Apoiador Oficial',
        tagline: 'Líder em Cosméticos Hipoalergênicos e Tratamento da Pelagem',
        description: 'Fornecedora oficial de 100% dos shampoos veganos, máscaras de hidratação e finalizadores dermatológicos utilizados nas aulas práticas da ONG.',
        logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gp" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f472b6"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23fdf2f8"/><circle cx="50" cy="50" r="30" fill="url(%23gp)"/><path d="M42 38c-3 0-5 2-5 5 0 6 13 18 13 18s13-12 13-18c0-3-2-5-5-5-3 0-6 3-8 6-2-3-5-6-8-6z" fill="%23ffffff"/></svg>',
        websiteUrl: 'https://groomerpro.com.br',
        contributionType: 'Insumos Cosméticos & Manutenção de Laboratório',
        studentsSupported: 240
      },
      {
        id: 'sp-titanium',
        name: 'Titanium Blades & Pro Scissors',
        category: 'Diamante',
        badgeLabel: '⭐ Cota Diamante',
        tagline: 'Alta Precisão e Tecnologia em Tesouras e Lâminas Alemãs',
        description: 'Equipa todas as bancadas dos nossos cursos com tesouras curvas, retas, tubarão e kits completos de lâminas profissionais de alta durabilidade.',
        logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="tb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d49a37"/><stop offset="100%" stop-color="%23132a47"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23fef7ec"/><circle cx="50" cy="50" r="30" fill="url(%23tb)"/><path d="M40 35l20 30m0-30L40 65" stroke="%23ffffff" stroke-width="6" stroke-linecap="round"/></svg>',
        websiteUrl: 'https://titaniumblades.com',
        contributionType: 'Kits de Tesouras Profissionais & Máquinas de Tosa',
        studentsSupported: 180
      },
      {
        id: 'sp-petcare',
        name: 'Rede PetCare Centros Veterinários & Diagnóstico',
        category: 'Ouro',
        badgeLabel: '⭐ Cota Ouro',
        tagline: 'Excelência em Medicina Veterinária e Cuidado Integral',
        description: 'Disponibiliza médicos veterinários residentes para suporte em aula, triagem preventiva dos pets e contratação direta dos alunos formados.',
        logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="pc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230ea5e9"/><stop offset="100%" stop-color="%230284c7"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23f0f9ff"/><circle cx="50" cy="50" r="30" fill="url(%23pc)"/><path d="M50 35v30M35 50h30" stroke="%23ffffff" stroke-width="7" stroke-linecap="round"/></svg>',
        websiteUrl: 'https://petcare.vet.br',
        contributionType: 'Acompanhamento & Encaminhamento de Empregos',
        studentsSupported: 160
      },
      {
        id: 'sp-aquadry',
        name: 'AquaDry Sopradores & Banheiras Inox',
        category: 'Ouro',
        badgeLabel: '⭐ Cota Ouro',
        tagline: 'Engenharia Silenciosa e Ergonômica para Banho & Tosa',
        description: 'Estruturou nossas salas com banheiras reguláveis em aço inox 304 e sopradores de baixo decibéis com tecnologia antiestresse para os cães.',
        logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="ad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%230891b2"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23ecfeff"/><circle cx="50" cy="50" r="30" fill="url(%23ad)"/><path d="M50 32c-7 10-15 17-15 24a15 15 0 0 0 30 0c0-7-8-14-15-24z" fill="%23ffffff"/></svg>',
        websiteUrl: 'https://aquadrypet.com.br',
        contributionType: 'Infraestrutura de Laboratório & Secadores Silenciosos',
        studentsSupported: 130
      },
      {
        id: 'sp-nutripet',
        name: 'NutriPet Nutrição Super Premium',
        category: 'Prata',
        badgeLabel: '⭐ Cota Prata',
        tagline: 'Nutrição Balanceada e Bem-Estar Canino e Felino',
        description: 'Oferece petiscos funcionais de reforço positivo para treino de manejo amigável durante o banho e doa ração para protetores atendidos.',
        logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="np" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23fffbeb"/><circle cx="50" cy="50" r="30" fill="url(%23np)"/><ellipse cx="50" cy="58" rx="14" ry="10" fill="%23ffffff"/><circle cx="38" cy="44" r="5" fill="%23ffffff"/><circle cx="62" cy="44" r="5" fill="%23ffffff"/><circle cx="45" cy="36" r="4.5" fill="%23ffffff"/><circle cx="55" cy="36" r="4.5" fill="%23ffffff"/></svg>',
        websiteUrl: 'https://nutripet.com.br',
        contributionType: 'Alimentação & Reforço Positivo em Aula',
        studentsSupported: 95
      },
      {
        id: 'sp-mundoanimal',
        name: 'Mundo Animal Grooming & Pet Shops',
        category: 'Prata',
        badgeLabel: '⭐ Cota Prata',
        tagline: 'Rede com mais de 40 lojas em todo o estado',
        description: 'Principal empresa contratante dos nossos formandos, concedendo prioridade de contratação para os alunos certificados pela ONG.',
        logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="ma" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23ecfdf5"/><circle cx="50" cy="50" r="30" fill="url(%23ma)"/><path d="M36 44h28v22H36z" fill="%23ffffff"/><path d="M32 44l18-12 18 12" stroke="%23ffffff" stroke-width="4" fill="none" stroke-linejoin="round"/></svg>',
        websiteUrl: 'https://mundoanimalpet.com.br',
        contributionType: 'Programa Jovem Groomer & Contratação Efetiva',
        studentsSupported: 150
      },
      {
        id: 'sp-groomertech',
        name: 'GroomerTech Software & Gestão Pet',
        category: 'Parceiro Técnico',
        badgeLabel: '⭐ Parceiro Técnico',
        tagline: 'Sistemas de Agendamento e Gestão para Negócios Pet',
        description: 'Concede 1 ano de acesso 100% gratuito ao seu software de gestão para todos os formandos que abrem seu próprio Pet Móvel ou Pet Shop.',
        logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%236d28d9"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23f5f3ff"/><circle cx="50" cy="50" r="30" fill="url(%23gt)"/><path d="M40 42h20v16H40z" fill="%23ffffff"/><path d="M45 58v4h10v-4" stroke="%23ffffff" stroke-width="3"/></svg>',
        websiteUrl: 'https://groomertech.io',
        contributionType: 'Licenças Gratuitas de Tecnologia para Empreendedores',
        studentsSupported: 75
      }
    ];
  }

  private getSeedTestimonials(): Testimonial[] {
    return [
      {
        id: 'dep-1',
        authorName: 'Camila Rodrigues',
        courseCompleted: 'Especialização em Tosa Comercial & Tesoura',
        year: 2025,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        story: 'A ONG Mãos que Cuidam mudou o rumo da minha vida. Eu morava no bairro Barra em Macaé e estava desempregada há quase um ano. Os professores me ensinaram com uma paciência incrível. Hoje trabalho com carteira assinada em uma grande clínica pet nos Cavaleiros e sustento minha família com dignidade!',
        currentRole: 'Tosadora Profissional (Macaé / RJ)',
        rating: 5
      },
      {
        id: 'dep-2',
        authorName: 'Marcos Vinícius Andrade',
        courseCompleted: 'Formação Básica em Banho & Empreendedorismo Pet',
        year: 2025,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        story: 'O respeito e o amor que a ONG ensina em relação aos animais é algo único. Aprendi a lidar com cães assustados sem usar força ou sedação. Com o apoio da equipe, montei meu Pet Móvel atendendo os bairros Imbetiba, Glória e Parque Aeroporto!',
        currentRole: 'Empreendedor Autônomo (Pet Móvel Carinho - Macaé)',
        rating: 5
      },
      {
        id: 'dep-3',
        authorName: 'Renata Silveira',
        courseCompleted: 'Tosa Bebê & Primeiros Socorros Pet',
        year: 2024,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        story: 'Levei meu cachorrinho resgatado para o banho social gratuito e fiquei apaixonada pela ONG. Me inscrevi no curso, me formei e hoje além de trabalhar na área, sou voluntária nos fins de semana ajudando nas aulas práticas para as novas turmas!',
        currentRole: 'Instrutora Voluntária & Groomer',
        rating: 5
      },
      {
        id: 'dep-4',
        authorName: 'Dona Sônia Regina (Tutora)',
        courseCompleted: 'Atendimento do Banho Social Gratuito',
        year: 2025,
        avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
        story: 'Resgatei 2 cachorrinhos da rua com pelos muito embolados e machucados. Eu não tinha condições de pagar pet shop. A equipe da ONG recebeu a gente com um carinho que me fez chorar. Eles trataram meus bichinhos como príncipes!',
        currentRole: 'Moradora de Macaé (Bairro Barra)',
        rating: 5
      }
    ];
  }

  private getSeedImpactStats(): ImpactStat[] {
    return [
      { id: 'stat-1', number: '+520', label: 'Alunos Capacitados', sublabel: 'com formação prática de excelência', icon: 'graduation' },
      { id: 'stat-2', number: '+2.850', label: 'Banhos & Tosas Sociais', sublabel: 'em cães resgatados e de famílias carentes', icon: 'paw' },
      { id: 'stat-3', number: '94%', label: 'Índice de Inserção', sublabel: 'trabalhando ou com negócio próprio', icon: 'trending' },
      { id: 'stat-4', number: '100%', label: 'Gratuito & Social', sublabel: 'sem custos para alunos de baixa renda', icon: 'heart' }
    ];
  }

  private getSeedVideoAds(): VideoAd[] {
    return [
      {
        id: 'ad_left_1',
        position: 'left',
        title: 'Shampoos Hipoalergênicos & Cosmética Pet',
        sponsorName: 'Pet Clean Macaé',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dog-taking-a-shower-in-a-bathtub-41481-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80',
        clickUrl: 'https://wa.me/5522998481112?text=Ol%C3%A1,%20gostaria%20de%20saber%20mais%20sobre%20os%20produtos%20do%20an%C3%BAncio%20no%20site%20da%20ONG%20M%C3%A3os%20que%20Cuidam',
        badgeText: '✨ PATROCINADOR MASTER',
        description: 'Apoiando o banho social gratuito para centenas de cães acolhidos em Macaé/RJ.',
        active: true
      },
      {
        id: 'ad_right_1',
        position: 'right',
        title: 'Máquinas de Tosa & Lâminas de Alta Precisão',
        sponsorName: 'Groomer Pro Ferramentas',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-dog-getting-a-haircut-41480-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=80',
        clickUrl: 'https://wa.me/5522998481112?text=Ol%C3%A1,%20gostaria%20de%20anunciar%20minha%20empresa%20nas%20abas%20laterais%20do%20site%20da%20ONG',
        badgeText: '⭐ PARCEIRO DIAMANTE',
        description: 'Tecnologia profissional a serviço da qualificação de jovens e famílias.',
        active: true
      }
    ];
  }

  constructor() {
    this.loadFromStorage();
  }

  getVideoAds(): VideoAd[] {
    return [...this.videoAdsSignal()];
  }

  addVideoAd(data: Omit<VideoAd, 'id'>): VideoAd {
    const newAd: VideoAd = {
      ...data,
      id: 'ad_' + data.position + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    };
    const updated = [newAd, ...this.videoAdsSignal()];
    this.videoAdsSignal.set(updated);
    this.saveVideoAds(updated);
    this.firebaseService.saveDocument('configuracoes', 'video_ad_' + newAd.id, newAd);
    return newAd;
  }

  updateVideoAd(id: string, data: Partial<VideoAd>): void {
    const updated = this.videoAdsSignal().map(ad => ad.id === id ? { ...ad, ...data } : ad);
    this.videoAdsSignal.set(updated);
    this.saveVideoAds(updated);
    this.firebaseService.saveDocument('configuracoes', 'video_ad_' + id, data);
  }

  deleteVideoAd(id: string): void {
    const updated = this.videoAdsSignal().filter(ad => ad.id !== id);
    this.videoAdsSignal.set(updated);
    this.saveVideoAds(updated);
  }

  getImpactStats(): ImpactStat[] {
    return [...this.impactStatsSignal()];
  }

  updateImpactStats(stats: ImpactStat[]): void {
    this.impactStatsSignal.set(stats);
    this.saveImpactStats(stats);
    this.firebaseService.saveDocument('configuracoes', 'impact_stats', { stats });
  }

  getCourses(): Course[] {
    return [...this.coursesList];
  }

  getCourseById(id: string): Course | undefined {
    return this.coursesList.find(c => c.id === id);
  }

  getSponsors(): Sponsor[] {
    return [...this.sponsorsSignal()];
  }

  addSponsor(data: Omit<Sponsor, 'id'>): Sponsor {
    const newSp: Sponsor = {
      ...data,
      id: 'sp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    };
    const updated = [newSp, ...this.sponsorsSignal()];
    this.sponsorsSignal.set(updated);
    this.saveSponsors(updated);
    this.firebaseService.saveDocument('patrocinadores', newSp.id, newSp);
    return newSp;
  }

  updateSponsor(id: string, data: Partial<Sponsor>): void {
    const updated = this.sponsorsSignal().map(s => s.id === id ? { ...s, ...data } : s);
    this.sponsorsSignal.set(updated);
    this.saveSponsors(updated);
    this.firebaseService.saveDocument('patrocinadores', id, data);
  }

  deleteSponsor(id: string): void {
    const updated = this.sponsorsSignal().filter(s => s.id !== id);
    this.sponsorsSignal.set(updated);
    this.saveSponsors(updated);
  }

  getTestimonials(): Testimonial[] {
    return [...this.testimonialsSignal()];
  }

  addTestimonial(data: Omit<Testimonial, 'id'>): Testimonial {
    const newDep: Testimonial = {
      ...data,
      id: 'dep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    };
    const updated = [newDep, ...this.testimonialsSignal()];
    this.testimonialsSignal.set(updated);
    this.saveTestimonials(updated);
    this.firebaseService.saveDocument('depoimentos', newDep.id, newDep);
    return newDep;
  }

  deleteTestimonial(id: string): void {
    const updated = this.testimonialsSignal().filter(d => d.id !== id);
    this.testimonialsSignal.set(updated);
    this.saveTestimonials(updated);
  }

  getGalleryItems(): PetGalleryItem[] {
    return [...this.gallerySignal()];
  }

  getAdoptablePets(): AdoptablePet[] {
    return [...this.adoptablePetsSignal()];
  }

  // --- MÉTODOS DE ADOÇÃO E DOAÇÃO DE PETS ---
  registerPetForDonation(data: Omit<AdoptablePet, 'id' | 'createdAt' | 'status'>): AdoptablePet {
    const newPet: AdoptablePet = {
      ...data,
      id: 'ado_pet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      status: 'Disponível',
      createdAt: new Date().toISOString()
    };

    const updated = [newPet, ...this.adoptablePetsSignal()];
    this.adoptablePetsSignal.set(updated);
    this.saveAdoptablePets(updated);

    // Sincronização em Nuvem (Firestore)
    this.firebaseService.saveDocument('pets_adocao', newPet.id, newPet);
    return newPet;
  }

  registerAdoptionApplication(data: Omit<AdoptionApplication, 'id' | 'protocol' | 'createdAt' | 'status'>): AdoptionApplication {
    const newApp: AdoptionApplication = {
      ...data,
      id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      protocol: 'ADO-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
      status: 'Em Análise',
      createdAt: new Date().toISOString()
    };

    const updated = [newApp, ...this.adoptionApplicationsSignal()];
    this.adoptionApplicationsSignal.set(updated);
    this.saveAdoptionApplications(updated);

    // Sincronização em Nuvem (Firestore) & E-mail
    this.firebaseService.saveDocument('pedidos_adocao', newApp.id, newApp);
    this.notificationService.sendEmail('template_novo_pedido_adocao', {
      protocol: newApp.protocol,
      petName: newApp.petName,
      adopterName: newApp.adopterName,
      adopterPhone: newApp.adopterPhone,
      adopterEmail: newApp.adopterEmail,
      motivation: newApp.motivation
    });

    return newApp;
  }

  updateAdoptablePetStatus(id: string, status: 'Disponível' | 'Adotado' | 'Em Processo'): void {
    const updated = this.adoptablePetsSignal().map(p => p.id === id ? { ...p, status } : p);
    this.adoptablePetsSignal.set(updated);
    this.saveAdoptablePets(updated);
    this.firebaseService.saveDocument('pets_adocao', id, { status });
  }

  deleteAdoptablePet(id: string): void {
    const updated = this.adoptablePetsSignal().filter(p => p.id !== id);
    this.adoptablePetsSignal.set(updated);
    this.saveAdoptablePets(updated);
  }

  // --- GALERIA ANTES & DEPOIS ---
  addGalleryItem(item: Omit<PetGalleryItem, 'id' | 'date'> & { date?: string; likesCount?: number }): PetGalleryItem {
    const newItem: PetGalleryItem = {
      ...item,
      id: 'gal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: item.date || new Date().toISOString(),
      likesCount: item.likesCount !== undefined ? item.likesCount : 1
    };

    const updated = [newItem, ...this.gallerySignal()];
    this.gallerySignal.set(updated);
    this.saveGallery(updated);
    this.firebaseService.saveDocument('galeria_transformacoes', newItem.id, newItem);
    return newItem;
  }

  likeGalleryItem(id: string): void {
    const updated = this.gallerySignal().map(item => {
      if (item.id === id) {
        return { ...item, likesCount: item.likesCount + 1 };
      }
      return item;
    });
    this.gallerySignal.set(updated);
    this.saveGallery(updated);
  }

  deleteGalleryItem(id: string): void {
    const updated = this.gallerySignal().filter(item => item.id !== id);
    this.gallerySignal.set(updated);
    this.saveGallery(updated);
  }

  // --- PROPOSTAS DE PATROCÍNIO ---
  registerSponsorProposal(data: Omit<SponsorProposal, 'id' | 'protocol' | 'createdAt' | 'status'>): SponsorProposal {
    const newProposal: SponsorProposal = {
      ...data,
      id: 'sp_prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      protocol: 'PAT-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };

    const updated = [newProposal, ...this.sponsorProposalsSignal()];
    this.sponsorProposalsSignal.set(updated);
    this.saveProposals(updated);

    this.firebaseService.saveDocument('propostas_patrocinio', newProposal.id, newProposal);
    return newProposal;
  }

  // --- ALUNOS ---
  registerStudent(data: Omit<StudentRegistration, 'id' | 'protocol' | 'createdAt' | 'status'>): StudentRegistration {
    const newStudent: StudentRegistration = {
      ...data,
      id: 'std_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      protocol: 'ALU-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };

    const updated = [newStudent, ...this.studentsSignal()];
    this.studentsSignal.set(updated);
    this.saveStudents(updated);

    // Sincronização em Nuvem (Firestore) & E-mail
    this.firebaseService.saveDocument('alunos', newStudent.id, newStudent);
    this.notificationService.sendEmail('template_nova_inscricao', {
      protocol: newStudent.protocol,
      fullName: newStudent.fullName,
      email: newStudent.email,
      phone: newStudent.phone,
      courseId: newStudent.courseId,
      preferredShift: newStudent.preferredShift,
      city: newStudent.city
    });

    return newStudent;
  }

  updateStudentStatus(id: string, status: RegistrationStatus): void {
    const updated = this.studentsSignal().map(std => std.id === id ? { ...std, status } : std);
    this.studentsSignal.set(updated);
    this.saveStudents(updated);
    this.firebaseService.saveDocument('alunos', id, { status });
  }

  deleteStudent(id: string): void {
    const updated = this.studentsSignal().filter(std => std.id !== id);
    this.studentsSignal.set(updated);
    this.saveStudents(updated);
  }

  // --- VOLUNTÁRIOS ---
  registerVolunteer(data: Omit<VolunteerRegistration, 'id' | 'protocol' | 'createdAt' | 'status'>): VolunteerRegistration {
    const newVol: VolunteerRegistration = {
      ...data,
      id: 'vol_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      protocol: 'VOL-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
      status: 'Em Análise',
      createdAt: new Date().toISOString()
    };

    const updated = [newVol, ...this.volunteersSignal()];
    this.volunteersSignal.set(updated);
    this.saveVolunteers(updated);

    this.firebaseService.saveDocument('voluntarios', newVol.id, newVol);
    return newVol;
  }

  updateVolunteerStatus(id: string, status: RegistrationStatus): void {
    const updated = this.volunteersSignal().map(v => v.id === id ? { ...v, status } : v);
    this.volunteersSignal.set(updated);
    this.saveVolunteers(updated);
    this.firebaseService.saveDocument('voluntarios', id, { status });
  }

  deleteVolunteer(id: string): void {
    const updated = this.volunteersSignal().filter(v => v.id !== id);
    this.volunteersSignal.set(updated);
    this.saveVolunteers(updated);
  }

  // --- PETS SOCIAIS ---
  registerPet(data: Omit<PetRegistration, 'id' | 'protocol' | 'createdAt' | 'status'>): PetRegistration {
    const newPet: PetRegistration = {
      ...data,
      id: 'pet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      protocol: 'PET-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };

    const updated = [newPet, ...this.petsSignal()];
    this.petsSignal.set(updated);
    this.savePets(updated);

    this.firebaseService.saveDocument('pets_banho_social', newPet.id, newPet);
    return newPet;
  }

  updatePetStatus(id: string, status: RegistrationStatus): void {
    const updated = this.petsSignal().map(p => p.id === id ? { ...p, status } : p);
    this.petsSignal.set(updated);
    this.savePets(updated);
    this.firebaseService.saveDocument('pets_banho_social', id, { status });
  }

  deletePet(id: string): void {
    const updated = this.petsSignal().filter(p => p.id !== id);
    this.petsSignal.set(updated);
    this.savePets(updated);
  }

  // --- PERSISTÊNCIA LOCALSTORAGE ---
  private loadFromStorage(): void {
    try {
      const storedStudents = localStorage.getItem(this.STUDENTS_KEY);
      if (storedStudents) {
        this.studentsSignal.set(JSON.parse(storedStudents));
      } else {
        const seed = this.getSeedStudents();
        this.studentsSignal.set(seed);
        this.saveStudents(seed);
      }

      const storedVolunteers = localStorage.getItem(this.VOLUNTEERS_KEY);
      if (storedVolunteers) {
        this.volunteersSignal.set(JSON.parse(storedVolunteers));
      } else {
        const seed = this.getSeedVolunteers();
        this.volunteersSignal.set(seed);
        this.saveVolunteers(seed);
      }

      const storedPets = localStorage.getItem(this.PETS_KEY);
      if (storedPets) {
        this.petsSignal.set(JSON.parse(storedPets));
      } else {
        const seed = this.getSeedPets();
        this.petsSignal.set(seed);
        this.savePets(seed);
      }

      const storedProposals = localStorage.getItem(this.SPONSOR_PROPOSALS_KEY);
      if (storedProposals) {
        this.sponsorProposalsSignal.set(JSON.parse(storedProposals));
      }

      const storedGallery = localStorage.getItem(this.GALLERY_KEY);
      if (storedGallery) {
        this.gallerySignal.set(JSON.parse(storedGallery));
      } else {
        const seed = this.getSeedGallery();
        this.gallerySignal.set(seed);
        this.saveGallery(seed);
      }

      const storedAdoptablePets = localStorage.getItem(this.ADOPTABLE_PETS_KEY);
      if (storedAdoptablePets) {
        this.adoptablePetsSignal.set(JSON.parse(storedAdoptablePets));
      } else {
        const seed = this.getSeedAdoptablePets();
        this.adoptablePetsSignal.set(seed);
        this.saveAdoptablePets(seed);
      }

      const storedAdoptionApps = localStorage.getItem(this.ADOPTION_APPLICATIONS_KEY);
      if (storedAdoptionApps) {
        this.adoptionApplicationsSignal.set(JSON.parse(storedAdoptionApps));
      }

      const storedSponsors = localStorage.getItem(this.SPONSORS_KEY);
      if (storedSponsors) {
        this.sponsorsSignal.set(JSON.parse(storedSponsors));
      } else {
        const seed = this.getSeedSponsors();
        this.sponsorsSignal.set(seed);
        this.saveSponsors(seed);
      }

      const storedTestimonials = localStorage.getItem(this.TESTIMONIALS_KEY);
      if (storedTestimonials) {
        this.testimonialsSignal.set(JSON.parse(storedTestimonials));
      } else {
        const seed = this.getSeedTestimonials();
        this.testimonialsSignal.set(seed);
        this.saveTestimonials(seed);
      }

      const storedStats = localStorage.getItem(this.IMPACT_STATS_KEY);
      if (storedStats) {
        this.impactStatsSignal.set(JSON.parse(storedStats));
      } else {
        const seed = this.getSeedImpactStats();
        this.impactStatsSignal.set(seed);
        this.saveImpactStats(seed);
      }

      const storedVideoAds = localStorage.getItem(this.VIDEO_ADS_KEY);
      if (storedVideoAds) {
        this.videoAdsSignal.set(JSON.parse(storedVideoAds));
      } else {
        const seed = this.getSeedVideoAds();
        this.videoAdsSignal.set(seed);
        this.saveVideoAds(seed);
      }
    } catch (e) {
      console.warn('Erro ao carregar do localStorage:', e);
      this.studentsSignal.set(this.getSeedStudents());
      this.volunteersSignal.set(this.getSeedVolunteers());
      this.petsSignal.set(this.getSeedPets());
      this.gallerySignal.set(this.getSeedGallery());
      this.adoptablePetsSignal.set(this.getSeedAdoptablePets());
      this.sponsorsSignal.set(this.getSeedSponsors());
      this.testimonialsSignal.set(this.getSeedTestimonials());
      this.impactStatsSignal.set(this.getSeedImpactStats());
      this.videoAdsSignal.set(this.getSeedVideoAds());
    }
  }

  private saveVideoAds(data: VideoAd[]): void {
    try { localStorage.setItem(this.VIDEO_ADS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private saveImpactStats(data: ImpactStat[]): void {
    try { localStorage.setItem(this.IMPACT_STATS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private saveTestimonials(data: Testimonial[]): void {
    try { localStorage.setItem(this.TESTIMONIALS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private saveSponsors(data: Sponsor[]): void {
    try { localStorage.setItem(this.SPONSORS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private saveStudents(data: StudentRegistration[]): void {
    try { localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private saveVolunteers(data: VolunteerRegistration[]): void {
    try { localStorage.setItem(this.VOLUNTEERS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private savePets(data: PetRegistration[]): void {
    try { localStorage.setItem(this.PETS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private saveProposals(data: SponsorProposal[]): void {
    try { localStorage.setItem(this.SPONSOR_PROPOSALS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private saveGallery(data: PetGalleryItem[]): void {
    try { localStorage.setItem(this.GALLERY_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private saveAdoptablePets(data: AdoptablePet[]): void {
    try { localStorage.setItem(this.ADOPTABLE_PETS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  private saveAdoptionApplications(data: AdoptionApplication[]): void {
    try { localStorage.setItem(this.ADOPTION_APPLICATIONS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
  }

  resetAllData(): void {
    const seedStudents = this.getSeedStudents();
    const seedVolunteers = this.getSeedVolunteers();
    const seedPets = this.getSeedPets();
    const seedGallery = this.getSeedGallery();
    const seedAdoptablePets = this.getSeedAdoptablePets();

    this.studentsSignal.set(seedStudents);
    this.volunteersSignal.set(seedVolunteers);
    this.petsSignal.set(seedPets);
    this.gallerySignal.set(seedGallery);
    this.adoptablePetsSignal.set(seedAdoptablePets);

    this.saveStudents(seedStudents);
    this.saveVolunteers(seedVolunteers);
    this.savePets(seedPets);
    this.saveGallery(seedGallery);
    this.saveAdoptablePets(seedAdoptablePets);
  }

  private getSeedAdoptablePets(): AdoptablePet[] {
    return [
      {
        id: 'ado_1',
        name: 'Pipoca',
        species: 'Cão',
        gender: 'Macho',
        ageCategory: 'Adulto',
        ageText: '2 anos',
        size: 'Porte Pequeno',
        breed: 'Poodle Toy / SRD',
        photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
        additionalPhotos: [
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop&q=80'
        ],
        isCastrated: true,
        isVaccinated: true,
        isDewormed: true,
        isSpecialNeeds: false,
        aggressionHistory: 'Sem histórico de agressividade (Muito dócil e sociável)',
        temperament: 'Dócil, afetuoso e calmo em apartamento',
        story: 'Pipoca foi resgatado e totalmente higienizado e cuidado pelos alunos da ONG. Agora está pronto para encontrar uma família cheia de amor em Macaé!',
        donorName: 'ONG Mãos que Cuidam',
        donorPhone: '(22) 99848-1112',
        donorEmail: 'contato@maosquecuidam.org.br',
        donorType: 'ONG Mãos que Cuidam',
        city: 'Macaé',
        neighborhood: 'Barra',
        status: 'Disponível',
        protectionDeclaration: true,
        createdAt: '2026-08-28T10:00:00.000Z'
      },
      {
        id: 'ado_2',
        name: 'Luna',
        species: 'Gato',
        gender: 'Fêmea',
        ageCategory: 'Filhote',
        ageText: '8 meses',
        size: 'Porte Pequeno',
        breed: 'Frajolinha Muito Carinhosa',
        photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
        additionalPhotos: [
          'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&auto=format&fit=crop&q=80'
        ],
        isCastrated: true,
        isVaccinated: true,
        isDewormed: true,
        isSpecialNeeds: false,
        aggressionHistory: 'Sem histórico de agressividade (Mansa e brincalhona)',
        temperament: 'Super ronronante, brincalhona e acostumada com outros gatos',
        story: 'Luna foi acolhida por uma protetora parceira da ONG após ser encontrada filhote. É extremamente mansa e ama dormir no colo.',
        donorName: 'Patrícia Helena (Protetora)',
        donorPhone: '(22) 99848-1112',
        donorEmail: 'patricia.resgates@email.com',
        donorType: 'Protetor Independente',
        city: 'Macaé',
        neighborhood: 'Cavaleiros',
        status: 'Disponível',
        protectionDeclaration: true,
        createdAt: '2026-08-29T15:30:00.000Z'
      },
      {
        id: 'ado_3',
        name: 'Max',
        species: 'Cão',
        gender: 'Macho',
        ageCategory: 'Adulto',
        ageText: '3 anos',
        size: 'Porte Médio',
        breed: 'Vira-lata Caramelo Dourado',
        photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=80',
        additionalPhotos: [
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&auto=format&fit=crop&q=80'
        ],
        isCastrated: true,
        isVaccinated: true,
        isDewormed: true,
        isSpecialNeeds: false,
        aggressionHistory: 'Sem histórico de agressividade (Sociável com outros cães)',
        temperament: 'Alegre, sociável com outros cães e apaixonado por passeios',
        story: 'Max é o famoso vira-lata caramelo brasileiro: fiel, inteligente e muito companheiro. Recebeu banho e cuidados em aula e espera um quintal para brincar.',
        donorName: 'Marcos Vinícius',
        donorPhone: '(22) 99848-1112',
        donorEmail: 'marcos.tutor@email.com',
        donorType: 'Tutor Temporário',
        city: 'Macaé',
        neighborhood: 'Centro',
        status: 'Disponível',
        protectionDeclaration: true,
        createdAt: '2026-08-30T11:00:00.000Z'
      },
      {
        id: 'ado_4',
        name: 'Belinha',
        species: 'Cão',
        gender: 'Fêmea',
        ageCategory: 'Idoso',
        ageText: '7 anos',
        size: 'Porte Pequeno',
        breed: 'Maltês / Poodle Macia',
        photoUrl: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=600&auto=format&fit=crop&q=80',
        additionalPhotos: [
          'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&auto=format&fit=crop&q=80'
        ],
        isCastrated: true,
        isVaccinated: true,
        isDewormed: true,
        isSpecialNeeds: false,
        aggressionHistory: 'Sem histórico de agressividade (Calma e carinhosa com idosos)',
        temperament: 'Tranquila, adora uma caminha quentinha e quase não late',
        story: 'Belinha é ideal para pessoas idosas ou quem busca uma companheira sossegada para assistir TV juntinho no sofá. Já fez tosa bebê na ONG!',
        donorName: 'Dona Nair Silveira',
        donorPhone: '(22) 99848-1112',
        donorEmail: 'nair.silveira@email.com',
        donorType: 'Protetor Independente',
        city: 'Macaé',
        neighborhood: 'Praia Campista',
        status: 'Disponível',
        protectionDeclaration: true,
        createdAt: '2026-08-31T09:00:00.000Z'
      }
    ];
  }

  private getSeedGallery(): PetGalleryItem[] {
    return [
      {
        id: 'gal-1',
        petName: 'Pipoca',
        species: 'Cão',
        breed: 'Poodle Toy Resgatado',
        serviceDone: 'Tosa Bebê na Tesoura & Banho Hipoalergênico',
        beforeImageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80',
        afterImageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=80',
        story: 'Pipoca foi resgatado com pelos extremamente embolados e medo de barulho. Com manejo positivo e muito carinho, nossos alunos fizeram um desembolo indolor e uma tosa bebê impecável!',
        studentName: 'Juliana Mendes (Turma Manhã)',
        instructorName: 'Prof. Carlos Eduardo',
        date: '2026-08-25T10:00:00.000Z',
        category: 'Tosa Bebê',
        likesCount: 38
      },
      {
        id: 'gal-2',
        petName: 'Thor',
        species: 'Cão',
        breed: 'Golden Retriever',
        serviceDone: 'Desembolo Suave, Hidratação Profunda & Secagem Silenciosa',
        beforeImageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&auto=format&fit=crop&q=80',
        afterImageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&auto=format&fit=crop&q=80',
        story: 'Thor pertence a uma família carente da comunidade. Ele recebeu uma hidratação profunda com produtos doados pela GroomerPro e saiu super cheiroso e aliviado do calor.',
        studentName: 'Lucas Oliveira (Turma Sábado)',
        instructorName: 'Instrutora Renata Silveira',
        date: '2026-08-28T14:30:00.000Z',
        category: 'Banho & Desembolo',
        likesCount: 52
      },
      {
        id: 'gal-3',
        petName: 'Mel',
        species: 'Cão',
        breed: 'Shih Tzu',
        serviceDone: 'Tosa Higiênica, Corte de Unhas & Rostinho Redondo na Tesoura',
        beforeImageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=80',
        afterImageUrl: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=500&auto=format&fit=crop&q=80',
        story: 'Melzinha estava com a franja cobrindo a visão. Os alunos aprenderam o corte arredondado perfeito que valorizou toda a fofura dela com acabamento na tesoura reta.',
        studentName: 'Aline Ferreira (Turma Noite)',
        instructorName: 'Instrutora Renata Silveira',
        date: '2026-08-30T16:00:00.000Z',
        category: 'Antes & Depois',
        likesCount: 44
      },
      {
        id: 'gal-4',
        petName: 'Bidu',
        species: 'Cão',
        breed: 'Schnauzer / SRD',
        serviceDone: 'Tosa Padrão Comercial & Limpeza Auricular',
        beforeImageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=500&auto=format&fit=crop&q=80',
        afterImageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=500&auto=format&fit=crop&q=80',
        story: 'Cãozinho resgatado por abrigo parceiro. Foi preparado pelos alunos com direito a gravatinha para o evento de adoção e foi adotado no mesmo final de semana!',
        studentName: 'Camila Rodrigues (Formanda)',
        instructorName: 'Prof. Carlos Eduardo',
        date: '2026-09-01T11:00:00.000Z',
        category: 'Pet Resgatado',
        likesCount: 61
      }
    ];
  }

  private getSeedStudents(): StudentRegistration[] {
    return [
      {
        id: 'std_demo_1',
        protocol: 'ALU-2026-48291',
        fullName: 'Juliana Beatriz Mendes',
        email: 'juliana.mendes@email.com',
        phone: '(11) 98765-4321',
        cpf: '234.567.890-12',
        birthDate: '1998-05-14',
        city: 'São Paulo',
        neighborhood: 'Vila Mariana',
        courseId: 'curso-banho-higienizacao',
        courseName: 'Formação Básica em Banho & Higienização Pet',
        preferredShift: 'Manhã (08h às 12h)',
        employmentStatus: 'Buscando recolocação profissional',
        hasPetExperience: true,
        motivation: 'Sou apaixonada por animais e sonho em trabalhar na área para dar uma vida melhor aos meus dois cachorros resgatados.',
        status: 'Confirmado',
        createdAt: '2026-08-28T14:30:00.000Z'
      },
      {
        id: 'std_demo_2',
        protocol: 'ALU-2026-91823',
        fullName: 'Lucas Gabriel Oliveira',
        email: 'lucas.oliveira@email.com',
        phone: '(11) 97123-9988',
        cpf: '345.678.901-23',
        birthDate: '2001-11-20',
        city: 'São Paulo',
        neighborhood: 'Tatuapé',
        courseId: 'curso-tosa-comercial-tesoura',
        courseName: 'Especialização em Tosa Comercial & Técnicas na Tesoura',
        preferredShift: 'Sábados (08h às 17h)',
        employmentStatus: 'Autônomo',
        hasPetExperience: true,
        motivation: 'Já trabalho como banhista e quero me qualificar na tesoura para aumentar minha renda e abrir meu próprio espaço.',
        status: 'Pendente',
        createdAt: '2026-08-30T10:15:00.000Z'
      },
      {
        id: 'std_demo_3',
        protocol: 'ALU-2026-77312',
        fullName: 'Aline Souza Ferreira',
        email: 'aline.ferreira@email.com',
        phone: '(11) 96543-2109',
        cpf: '456.789.012-34',
        birthDate: '1995-03-08',
        city: 'Guarulhos',
        neighborhood: 'Centro',
        courseId: 'curso-empreendedorismo-pet',
        courseName: 'Empreendedorismo Pet & Atendimento com Amor',
        preferredShift: 'Noite (18h30 às 22h)',
        employmentStatus: 'Empregada em outro setor',
        hasPetExperience: false,
        motivation: 'Quero fazer transição de carreira para a área pet e aprender como gerenciar meu negócio.',
        status: 'Confirmado',
        createdAt: '2026-09-01T09:00:00.000Z'
      }
    ];
  }

  private getSeedVolunteers(): VolunteerRegistration[] {
    return [
      {
        id: 'vol_demo_1',
        protocol: 'VOL-2026-11409',
        fullName: 'Dra. Gabriela Castro',
        email: 'gabriela.vet@clinica.com.br',
        phone: '(11) 98877-6655',
        occupation: 'Médica Veterinária',
        areaOfInterest: 'Médico Veterinário Parceiro',
        experienceDescription: '8 anos de experiência em clínica médica e dermatologia animal.',
        availability: 'Quintas-feiras pela manhã e sábados alternados',
        status: 'Confirmado',
        createdAt: '2026-08-20T16:00:00.000Z'
      },
      {
        id: 'vol_demo_2',
        protocol: 'VOL-2026-88741',
        fullName: 'Carlos Eduardo Santos',
        email: 'carlos.groomer@email.com',
        phone: '(11) 97766-5544',
        occupation: 'Master Groomer Especialista',
        areaOfInterest: 'Instrutor de Banho e Tosa',
        experienceDescription: '12 anos como tosador e instrutor prático.',
        availability: 'Sábados o dia todo',
        status: 'Confirmado',
        createdAt: '2026-08-25T11:20:00.000Z'
      }
    ];
  }

  private getSeedPets(): PetRegistration[] {
    return [
      {
        id: 'pet_demo_1',
        protocol: 'PET-2026-30291',
        tutorName: 'Dona Maria de Lourdes',
        tutorPhone: '(11) 99112-3344',
        tutorCpf: '112.233.445-56',
        petName: 'Pipoca',
        petSpecies: 'Cão',
        petBreed: 'Sem Raça Definida (SRD)',
        petSize: 'Porte Pequeno (até 10kg)',
        petAge: '4 anos',
        isVaccinated: true,
        specialCareNotes: 'É dócil, mas tem um pouco de medo do barulho do secador.',
        preferredDay: 'Terça-feira ou Quinta-feira à tarde',
        status: 'Confirmado',
        createdAt: '2026-08-29T15:45:00.000Z'
      },
      {
        id: 'pet_demo_2',
        protocol: 'PET-2026-64102',
        tutorName: 'Roberto Alves',
        tutorPhone: '(11) 98223-4455',
        tutorCpf: '223.344.556-67',
        petName: 'Thor',
        petSpecies: 'Cão',
        petBreed: 'Golden Retriever Resgatado',
        petSize: 'Porte Grande (acima de 25kg)',
        petAge: '6 anos',
        isVaccinated: true,
        specialCareNotes: 'Super manso e brincalhão. Precisa de desembolo nos pelos traseiros.',
        preferredDay: 'Sábados pela manhã',
        status: 'Pendente',
        createdAt: '2026-08-31T08:30:00.000Z'
      }
    ];
  }
}
