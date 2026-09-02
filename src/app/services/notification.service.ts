import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly defaultPhone = environment.whatsappOng || '5522998481112';

  constructor() {
    if (environment.emailjs && environment.emailjs.publicKey && !environment.emailjs.publicKey.includes('SUA_PUBLIC_KEY')) {
      try {
        emailjs.init(environment.emailjs.publicKey);
        console.log('📧 [EmailJS] Serviço de notificação por e-mail inicializado.');
      } catch (e) {
        console.warn('⚠️ [EmailJS] Erro ao inicializar EmailJS:', e);
      }
    }
  }

  /**
   * Envia e-mail automático usando EmailJS
   */
  async sendEmail(templateId: string, templateParams: Record<string, any>): Promise<boolean> {
    if (!environment.emailjs || environment.emailjs.publicKey.includes('SUA_PUBLIC_KEY')) {
      console.log('ℹ️ [EmailJS] Simulação de envio de e-mail:', templateParams);
      return true;
    }

    try {
      await emailjs.send(
        environment.emailjs.serviceId,
        templateId,
        templateParams,
        environment.emailjs.publicKey
      );
      console.log('✅ [EmailJS] E-mail enviado com sucesso!');
      return true;
    } catch (err) {
      console.error('❌ [EmailJS] Falha ao enviar e-mail:', err);
      return false;
    }
  }

  /**
   * Gera link do WhatsApp com mensagem pré-formatada para o aluno enviar para a ONG
   */
  getStudentWhatsappLink(student: { fullName: string; protocol: string; courseId: string; phone: string }): string {
    const text = `Olá, equipe da *ONG Mãos que Cuidam*! 🐾\n\n` +
      `Acabei de me inscrever no curso gratuito de Banho e Tosa e gostaria de confirmar minha inscrição.\n\n` +
      `📋 *Meus Dados:*\n` +
      `• *Nome:* ${student.fullName}\n` +
      `• *Protocolo:* ${student.protocol}\n` +
      `• *Curso:* ${student.courseId}\n` +
      `• *WhatsApp:* ${student.phone}\n\n` +
      `Aguardo as orientações para o início das aulas. Muito obrigado(a)!`;

    return `https://wa.me/${this.defaultPhone}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Gera link do WhatsApp para agendamento de Banho Social de cão modelo
   */
  getPetWhatsappLink(pet: { tutorName: string; petName: string; protocol: string; tutorPhone: string; petSpecies?: string; petBreed?: string; serviceRequested?: string }): string {
    const text = `Olá, *ONG Mãos que Cuidam*! 🐶\n\n` +
      `Cadastrei meu pet para participar como cão modelo no banho social gratuito:\n\n` +
      `📋 *Ficha do Pet:*\n` +
      `• *Protocolo:* ${pet.protocol}\n` +
      `• *Nome do Pet:* ${pet.petName} (${pet.petSpecies || 'Pet'} - ${pet.petBreed || 'SRD'})\n` +
      `• *Tutor(a):* ${pet.tutorName}\n` +
      `• *WhatsApp do Tutor:* ${pet.tutorPhone}\n\n` +
      `Gostaria de agendar o dia do banho do meu animalzinho!`;

    return `https://wa.me/${this.defaultPhone}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Gera link do WhatsApp para pedido de adoção
   */
  getAdoptionWhatsappLink(application: { adopterName: string; petName: string; protocol: string; adopterPhone: string; donorPhone?: string }): string {
    const targetPhone = application.donorPhone ? application.donorPhone.replace(/\D/g, '') : this.defaultPhone;
    const cleanPhone = targetPhone.startsWith('55') ? targetPhone : `55${targetPhone}`;

    const text = `Olá! ❤️ Vi o anúncio do(a) *${application.petName}* no Mural de Adoção da ONG Mãos que Cuidam.\n\n` +
      `📋 *Meu Pedido de Adoção:*\n` +
      `• *Protocolo:* ${application.protocol}\n` +
      `• *Meu Nome:* ${application.adopterName}\n` +
      `• *Meu WhatsApp:* ${application.adopterPhone}\n\n` +
      `Gostaria de saber mais sobre ele(a) e combinar uma visita para conhecê-lo(a)!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Gera link do WhatsApp para propostas de empresas parceiras
   */
  getSponsorWhatsappLink(proposal: { companyName: string; representativeName: string; protocol: string; tierInterest: string }): string {
    const text = `Olá, Diretoria da *ONG Mãos que Cuidam*! ⭐\n\n` +
      `Represento a empresa *${proposal.companyName}* e acabamos de enviar uma proposta de parceria através do site.\n\n` +
      `📋 *Dados da Proposta:*\n` +
      `• *Protocolo:* ${proposal.protocol}\n` +
      `• *Representante:* ${proposal.representativeName}\n` +
      `• *Interesse de Apoio:* ${proposal.tierInterest}\n\n` +
      `Gostaríamos de agendar uma conversa para firmar esta parceria em prol da capacitação e bem-estar animal!`;

    return `https://wa.me/${this.defaultPhone}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Gera link com mensagem de alerta de segurança de login para o WhatsApp da Diretoria
   */
  getLoginAlertWhatsappLink(user: { name: string; email: string; role: string; isOwner?: boolean }): string {
    const now = new Date();
    const dataHoraFormatada = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR');

    const text = `🔔 *ALERTA DE SEGURANÇA - ACESSO À ÁREA DO COLABORADOR* 🔒\n` +
      `*ONG Mãos que Cuidam*\n\n` +
      `Um usuário acabou de iniciar sessão no painel interno:\n\n` +
      `👤 *Colaborador:* ${user.name}\n` +
      `✉️ *E-mail:* ${user.email}\n` +
      `💼 *Cargo:* ${user.role} ${user.isOwner ? '(👑 Dono/Master)' : ''}\n` +
      `🕒 *Data e Horário:* ${dataHoraFormatada}\n` +
      `📍 *Origem:* Acesso Web Autenticado\n\n` +
      `_Notificação de segurança da ONG Mãos que Cuidam._`;

    return `https://wa.me/${this.defaultPhone}?text=${encodeURIComponent(text)}`;
  }
}
