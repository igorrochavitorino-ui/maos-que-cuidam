import { Injectable, signal, computed } from '@angular/core';
import { Course, StudentRegistration, VolunteerRegistration, PetRegistration, Testimonial, Sponsor, SponsorProposal, RegistrationStatus } from '../models/registration.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private readonly STUDENTS_KEY = 'mqc_students_data';
  private readonly VOLUNTEERS_KEY = 'mqc_volunteers_data';
  private readonly PETS_KEY = 'mqc_pets_data';
  private readonly SPONSOR_PROPOSALS_KEY = 'mqc_sponsor_proposals_data';

  // Signals para reatividade pura
  private studentsSignal = signal<StudentRegistration[]>([]);
  private volunteersSignal = signal<VolunteerRegistration[]>([]);
  private petsSignal = signal<PetRegistration[]>([]);
  private sponsorProposalsSignal = signal<SponsorProposal[]>([]);

  // Computed signals
  readonly students = computed(() => this.studentsSignal());
  readonly volunteers = computed(() => this.volunteersSignal());
  readonly pets = computed(() => this.petsSignal());
  readonly sponsorProposals = computed(() => this.sponsorProposalsSignal());

  readonly totalStudents = computed(() => this.studentsSignal().length);
  readonly totalVolunteers = computed(() => this.volunteersSignal().length);
  readonly totalPets = computed(() => this.petsSignal().length);
  readonly totalProposals = computed(() => this.sponsorProposalsSignal().length);

  // Lista oficial de cursos da ONG Mãos que Cuidam
  private readonly coursesList: Course[] = [
    {
      id: 'curso-banho-higienizacao',
      title: 'Formação Básica em Banho & Higienização Pet',
      tagline: 'O ponto de partida essencial para cuidar de cães e gatos com amor, técnica e segurança.',
      shortDescription: 'Domine técnicas de manejo positivo sem estresse, secagem correta, corte de unhas, limpeza auricular e produtos adequados para cada pelagem.',
      fullDescription: 'Este curso prepara o aluno para os fundamentos da rotina de higienização pet, focando no bem-estar animal, redução de estresse e domínio técnico das principais etapas do banho comercial e de abrigo.',
      durationHours: 40,
      durationWeeks: 4,
      modality: 'Presencial Prático',
      level: 'Iniciante',
      scheduleOptions: ['Manhã (08h às 12h)', 'Tarde (13h30 às 17h30)', 'Sábados (08h às 17h)'],
      prerequisites: 'Idade mínima de 16 anos e amor pelos animais. Não requer experiência anterior.',
      certificateIncluded: true,
      maxStudentsPerClass: 12,
      icon: 'bath',
      badge: 'Mais Procurado',
      highlighted: true,
      modules: [
        {
          title: 'Módulo 1: Psicologia Canina & Manejo Sem Estresse',
          topics: ['Linguagem corporal e sinais de calma', 'Abordagem segura e contenção sem traumas', 'Prevenção de acidentes']
        },
        {
          title: 'Módulo 2: Cosmetologia Pet & Tipos de Pelagem',
          topics: ['Diferenciação de pelagens (lisa, encaracolada, dupla)', 'Shampoos neutros, hipoalergênicos e condicionadores', 'Desembolo suave e hidratações']
        },
        {
          title: 'Módulo 3: Prática Completa de Higienização',
          topics: ['Temperatura ideal da água e técnicas de ensaboamento', 'Corte e lixamento seguro de unhas', 'Higienização e secagem do conduto auditivo']
        },
        {
          title: 'Módulo 4: Secagem, Soprador e Escovação',
          topics: ['Uso correto do soprador para evitar estresse térmico', 'Escovação correta para desembaraço', 'Finalização com laços e bandanas artesanais']
        }
      ]
    },
    {
      id: 'curso-tosa-comercial-tesoura',
      title: 'Especialização em Tosa Comercial & Técnicas na Tesoura',
      tagline: 'Eleve o padrão do seu trabalho com tosas modernas, tosa bebê e acabamento perfeito.',
      shortDescription: 'Aprenda tosa higiênica, tosa padrão da máquina, tosa bebê em Spitz e Poodle, além do domínio de tesouras retas, curvas e tubarão.',
      fullDescription: 'Capacitação prática avançada para quem deseja atuar no mercado de trabalho ou abrir seu próprio negócio de banho e tosa, priorizando estética e conforto ao animal.',
      durationHours: 60,
      durationWeeks: 6,
      modality: 'Presencial Prático',
      level: 'Intermediário',
      scheduleOptions: ['Manhã (08h às 12h)', 'Tarde (13h30 às 17h30)', 'Sábados (08h às 17h)'],
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
      fullDescription: 'Ministrado com apoio de médicos veterinários voluntários parceiros da ONG para capacitar profissionais e protetores a agir com rapidez e segurança diante de imprevistos.',
      durationHours: 16,
      durationWeeks: 2,
      modality: 'Workshop',
      level: 'Todos os Níveis',
      scheduleOptions: ['Sábados (08h às 17h)', 'Noite (19h às 22h)'],
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
      durationHours: 20,
      durationWeeks: 2,
      modality: 'Intensivo',
      level: 'Iniciante',
      scheduleOptions: ['Noite (19h às 22h)', 'Sábados (08h às 12h)'],
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
  private readonly sponsorsList: Sponsor[] = [
    {
      id: 'sp-groomerpro',
      name: 'GroomerPro Cosméticos & Spa Pet',
      category: 'Diamante',
      tagline: 'Líder em Cosméticos Hipoalergênicos e Tratamento da Pelagem',
      description: 'Fornecedora oficial de 100% dos shampoos veganos, máscaras de hidratação e finalizadores dermatológicos utilizados nas aulas práticas da ONG.',
      logoIcon: '🧼',
      websiteUrl: 'https://groomerpro.com.br',
      contributionType: 'Insumos Cosméticos & Manutenção de Laboratório',
      studentsSupported: 240,
      sinceYear: 2023
    },
    {
      id: 'sp-titanium',
      name: 'Titanium Blades & Pro Scissors',
      category: 'Diamante',
      tagline: 'Alta Precisão e Tecnologia em Tesouras e Lâminas Alemãs',
      description: 'Equipa todas as bancadas dos nossos cursos com tesouras curvas, retas, tubarão e kits completos de lâminas profissionais de alta durabilidade.',
      logoIcon: '✂️',
      websiteUrl: 'https://titaniumblades.com',
      contributionType: 'Kits de Tesouras Profissionais & Máquinas de Tosa',
      studentsSupported: 180,
      sinceYear: 2023
    },
    {
      id: 'sp-petcare',
      name: 'Rede PetCare Centros Veterinários & Diagnóstico',
      category: 'Ouro',
      tagline: 'Excelência em Medicina Veterinária e Cuidado Integral',
      description: 'Disponibiliza médicos veterinários residentes para suporte em aula, triagem preventiva dos pets e contratação direta dos alunos formados.',
      logoIcon: '🏥',
      websiteUrl: 'https://petcare.vet.br',
      contributionType: 'Supervisão Veterinária & Encaminhamento de Empregos',
      studentsSupported: 160,
      sinceYear: 2024
    },
    {
      id: 'sp-aquadry',
      name: 'AquaDry Sopradores & Banheiras Inox',
      category: 'Ouro',
      tagline: 'Engenharia Silenciosa e Ergonômica para Banho & Tosa',
      description: 'Estruturou nossas salas com banheiras reguláveis em aço inox 304 e sopradores de baixo decibéis com tecnologia antiestresse para os cães.',
      logoIcon: '🚿',
      websiteUrl: 'https://aquadrypet.com.br',
      contributionType: 'Infraestrutura de Laboratório & Secadores Silenciosos',
      studentsSupported: 130,
      sinceYear: 2024
    },
    {
      id: 'sp-nutripet',
      name: 'NutriPet Nutrição Super Premium',
      category: 'Prata',
      tagline: 'Nutrição Balanceada e Bem-Estar Canino e Felino',
      description: 'Oferece petiscos funcionais de reforço positivo para treino de manejo amigável durante o banho e doa ração para protetores atendidos.',
      logoIcon: '🍖',
      websiteUrl: 'https://nutripet.com.br',
      contributionType: 'Alimentação & Reforço Positivo em Aula',
      studentsSupported: 95,
      sinceYear: 2025
    },
    {
      id: 'sp-mundoanimal',
      name: 'Mundo Animal Grooming & Pet Shops',
      category: 'Prata',
      tagline: 'Rede com mais de 40 lojas em todo o estado',
      description: 'Principal empresa contratante dos nossos formandos, concedendo prioridade de contratação para os alunos certificados pela ONG.',
      logoIcon: '🏬',
      websiteUrl: 'https://mundoanimalpet.com.br',
      contributionType: 'Programa Jovem Groomer & Contratação Efetiva',
      studentsSupported: 150,
      sinceYear: 2024
    },
    {
      id: 'sp-groomertech',
      name: 'GroomerTech Software & Gestão Pet',
      category: 'Parceiro Técnico',
      tagline: 'Sistemas de Agendamento e Gestão para Negócios Pet',
      description: 'Concede 1 ano de acesso 100% gratuito ao seu software de gestão para todos os formandos que abrem seu próprio Pet Móvel ou Pet Shop.',
      logoIcon: '💻',
      websiteUrl: 'https://groomertech.io',
      contributionType: 'Licenças Gratuitas de Tecnologia para Empreendedores',
      studentsSupported: 75,
      sinceYear: 2025
    }
  ];

  private readonly testimonialsList: Testimonial[] = [
    {
      id: 'dep-1',
      authorName: 'Camila Rodrigues',
      courseCompleted: 'Tosa Comercial & Tesoura',
      year: 2025,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      story: 'A ONG Mãos que Cuidam mudou o rumo da minha vida. Eu estava desempregada há quase um ano. Os professores me ensinaram com uma paciência incrível. Hoje trabalho com carteira assinada em uma grande clínica pet e sustento minha família!',
      currentRole: 'Tosadora Profissional no Pet Care Jardins',
      rating: 5
    },
    {
      id: 'dep-2',
      authorName: 'Marcos Vinícius Andrade',
      courseCompleted: 'Formação Básica em Banho & Higienização',
      year: 2025,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      story: 'O respeito e o amor que a ONG ensina em relação aos animais é algo que não se vê em nenhum outro curso pago. Aprendi a lidar com cães assustados sem usar força ou sedação. Montei meu banho e tosa domiciliar com apoio deles!',
      currentRole: 'Empreendedor Autônomo (Pet Móvel Carinho)',
      rating: 5
    },
    {
      id: 'dep-3',
      authorName: 'Renata Silveira',
      courseCompleted: 'Tosa Comercial & Empreendedorismo',
      year: 2024,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      story: 'Levei meu cachorrinho resgatado para o banho social e fiquei apaixonada pela ONG. Me inscrevi no curso de tosa e me formei com nota máxima. Hoje sou voluntária nos fins de semana e dou aula prática para as novas turmas!',
      currentRole: 'Instrutora Voluntária & Groomer',
      rating: 5
    }
  ];

  constructor() {
    this.loadFromStorage();
  }

  getCourses(): Course[] {
    return [...this.coursesList];
  }

  getCourseById(id: string): Course | undefined {
    return this.coursesList.find(c => c.id === id);
  }

  getSponsors(): Sponsor[] {
    return [...this.sponsorsList];
  }

  getTestimonials(): Testimonial[] {
    return [...this.testimonialsList];
  }

  // --- MÉTODOS DE PROPOSTAS DE PATROCÍNIO ---
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
    return newProposal;
  }

  // --- MÉTODOS DE ALUNOS ---
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
    return newStudent;
  }

  updateStudentStatus(id: string, status: RegistrationStatus): void {
    const updated = this.studentsSignal().map(std => std.id === id ? { ...std, status } : std);
    this.studentsSignal.set(updated);
    this.saveStudents(updated);
  }

  deleteStudent(id: string): void {
    const updated = this.studentsSignal().filter(std => std.id !== id);
    this.studentsSignal.set(updated);
    this.saveStudents(updated);
  }

  // --- MÉTODOS DE VOLUNTÁRIOS ---
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
    return newVol;
  }

  updateVolunteerStatus(id: string, status: RegistrationStatus): void {
    const updated = this.volunteersSignal().map(v => v.id === id ? { ...v, status } : v);
    this.volunteersSignal.set(updated);
    this.saveVolunteers(updated);
  }

  deleteVolunteer(id: string): void {
    const updated = this.volunteersSignal().filter(v => v.id !== id);
    this.volunteersSignal.set(updated);
    this.saveVolunteers(updated);
  }

  // --- MÉTODOS DE PETS SOCIAIS ---
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
    return newPet;
  }

  updatePetStatus(id: string, status: RegistrationStatus): void {
    const updated = this.petsSignal().map(p => p.id === id ? { ...p, status } : p);
    this.petsSignal.set(updated);
    this.savePets(updated);
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
        const seedStudents = this.getSeedStudents();
        this.studentsSignal.set(seedStudents);
        this.saveStudents(seedStudents);
      }

      const storedVolunteers = localStorage.getItem(this.VOLUNTEERS_KEY);
      if (storedVolunteers) {
        this.volunteersSignal.set(JSON.parse(storedVolunteers));
      } else {
        const seedVolunteers = this.getSeedVolunteers();
        this.volunteersSignal.set(seedVolunteers);
        this.saveVolunteers(seedVolunteers);
      }

      const storedPets = localStorage.getItem(this.PETS_KEY);
      if (storedPets) {
        this.petsSignal.set(JSON.parse(storedPets));
      } else {
        const seedPets = this.getSeedPets();
        this.petsSignal.set(seedPets);
        this.savePets(seedPets);
      }

      const storedProposals = localStorage.getItem(this.SPONSOR_PROPOSALS_KEY);
      if (storedProposals) {
        this.sponsorProposalsSignal.set(JSON.parse(storedProposals));
      }
    } catch (e) {
      console.warn('Erro ao carregar do localStorage:', e);
      this.studentsSignal.set(this.getSeedStudents());
      this.volunteersSignal.set(this.getSeedVolunteers());
      this.petsSignal.set(this.getSeedPets());
    }
  }

  private saveStudents(data: StudentRegistration[]): void {
    try {
      localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }

  private saveVolunteers(data: VolunteerRegistration[]): void {
    try {
      localStorage.setItem(this.VOLUNTEERS_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }

  private savePets(data: PetRegistration[]): void {
    try {
      localStorage.setItem(this.PETS_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }

  private saveProposals(data: SponsorProposal[]): void {
    try {
      localStorage.setItem(this.SPONSOR_PROPOSALS_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }

  resetAllData(): void {
    const seedStudents = this.getSeedStudents();
    const seedVolunteers = this.getSeedVolunteers();
    const seedPets = this.getSeedPets();

    this.studentsSignal.set(seedStudents);
    this.volunteersSignal.set(seedVolunteers);
    this.petsSignal.set(seedPets);

    this.saveStudents(seedStudents);
    this.saveVolunteers(seedVolunteers);
    this.savePets(seedPets);
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
        occupation: 'Médica Veterinária Dermatologista',
        areaOfInterest: 'Médico Veterinário Parceiro',
        experienceDescription: '8 anos de experiência em clínica médica e dermatologia animal. Quero ministrar palestras sobre cuidados de pele e primeiros socorros.',
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
        experienceDescription: '12 anos como tosador e juiz em competições. Desejo ensinar tosa na tesoura e padrão de raças para a nova geração.',
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
