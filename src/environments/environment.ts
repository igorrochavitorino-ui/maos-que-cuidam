export const environment = {
  production: false,
  
  // Configuração Oficial do Firebase / Firestore (Google Cloud)
  // Substitua com as chaves do Console do Firebase da sua ONG (https://console.firebase.google.com/)
  firebase: {
    apiKey: "AIzaSyD-SUA_CHAVE_API_FIREBASE",
    authDomain: "maos-que-cuidam-ong.firebaseapp.com",
    projectId: "maos-que-cuidam-ong",
    storageBucket: "maos-que-cuidam-ong.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
  },

  // Configuração do EmailJS para envio automático de e-mails
  // (https://www.emailjs.com/)
  emailjs: {
    serviceId: "service_maosquecuidam",
    templateIdAluno: "template_nova_inscricao",
    templateIdAdocao: "template_novo_pedido_adocao",
    publicKey: "SUA_PUBLIC_KEY_EMAILJS"
  },

  // WhatsApp Oficial da ONG para recepção de notificações
  whatsappOng: "5522998481112",
  emailOng: "contato@maosquecuidam.org.br"
};
