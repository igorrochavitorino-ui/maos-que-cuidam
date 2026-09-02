export interface CourseModule {
  title: string;
  topics: string[];
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  durationHours: number;
  durationWeeks: number;
  modality: 'Presencial Prático' | 'Intensivo' | 'Workshop';
  level: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos os Níveis';
  scheduleOptions: string[];
  prerequisites: string;
  certificateIncluded: boolean;
  maxStudentsPerClass: number;
  icon: string;
  badge?: string;
  highlighted?: boolean;
  modules: CourseModule[];
}

export type RegistrationStatus = 'Pendente' | 'Confirmado' | 'Em Análise' | 'Concluído' | 'Cancelado';

export interface StudentRegistration {
  id: string;
  protocol: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  city: string;
  neighborhood: string;
  courseId: string;
  courseName: string;
  preferredShift: 'Manhã (08h às 12h)' | 'Tarde (13h30 às 17h30)' | 'Noite (18h30 às 22h)' | 'Sábados (08h às 17h)';
  employmentStatus: string;
  hasPetExperience: boolean;
  motivation: string;
  status: RegistrationStatus;
  createdAt: string;
}

export interface VolunteerRegistration {
  id: string;
  protocol: string;
  fullName: string;
  email: string;
  phone: string;
  occupation: string;
  areaOfInterest: 'Instrutor de Banho e Tosa' | 'Médico Veterinário Parceiro' | 'Auxiliar e Manejo Pet' | 'Eventos e Comunicação' | 'Apoio Administrativo / Triagem';
  experienceDescription: string;
  availability: string;
  status: RegistrationStatus;
  createdAt: string;
}

export interface PetRegistration {
  id: string;
  protocol: string;
  tutorName: string;
  tutorPhone: string;
  tutorCpf: string;
  petName: string;
  petSpecies: 'Cão' | 'Gato';
  petBreed: string;
  petSize: 'Porte Pequeno (até 10kg)' | 'Porte Médio (10kg a 25kg)' | 'Porte Grande (acima de 25kg)';
  petAge: string;
  isVaccinated: boolean;
  specialCareNotes: string;
  preferredDay: string;
  status: RegistrationStatus;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  courseCompleted: string;
  year: number;
  avatarUrl: string;
  story: string;
  currentRole: string;
  rating: number;
}

export interface Sponsor {
  id: string;
  name: string;
  category: 'Diamante' | 'Ouro' | 'Prata' | 'Parceiro Técnico';
  tagline: string;
  description: string;
  logoIcon: string;
  websiteUrl: string;
  contributionType: string;
  studentsSupported: number;
  sinceYear: number;
}

export interface SponsorProposal {
  id: string;
  protocol: string;
  companyName: string;
  representativeName: string;
  email: string;
  phone: string;
  tierInterest: 'Cota Diamante (Mantenedor Master)' | 'Cota Ouro (Cosméticos & Insumos)' | 'Cota Prata (Equipamentos & Tesouras)' | 'Parceria de Empregabilidade / Vagas';
  proposalMessage: string;
  status: RegistrationStatus;
  createdAt: string;
}

export interface PetGalleryItem {
  id: string;
  petName: string;
  species: 'Cão' | 'Gato';
  breed: string;
  serviceDone: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  story: string;
  studentName: string;
  instructorName: string;
  date: string;
  category: 'Antes & Depois' | 'Tosa Bebê' | 'Banho & Desembolo' | 'Pet Resgatado';
  likesCount: number;
}

export interface AdoptablePet {
  id: string;
  name: string;
  species: 'Cão' | 'Gato';
  gender: 'Macho' | 'Fêmea';
  ageCategory: 'Filhote' | 'Adulto' | 'Idoso';
  ageText: string;
  size: 'Porte Pequeno' | 'Porte Médio' | 'Porte Grande';
  breed: string;
  photoUrl: string;
  isCastrated: boolean;
  isVaccinated: boolean;
  isDewormed: boolean;
  isSpecialNeeds: boolean;
  temperament: string;
  story: string;
  donorName: string;
  donorPhone: string;
  donorEmail: string;
  donorType: 'Protetor Independente' | 'Tutor Temporário' | 'Abrigo Parceiro' | 'ONG Mãos que Cuidam';
  city: string;
  neighborhood: string;
  status: 'Disponível' | 'Adotado' | 'Em Processo';
  createdAt: string;
}

export interface AdoptionApplication {
  id: string;
  protocol: string;
  petId: string;
  petName: string;
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string;
  adopterCpf: string;
  residenceType: 'Casa com Quintal Murado' | 'Apartamento com Redes de Proteção' | 'Chácara / Sítio Seguro';
  hasOtherPets: boolean;
  motivation: string;
  status: RegistrationStatus;
  createdAt: string;
}
