export const environment = {
  production: true,
  
  // Configuração Oficial do Firebase / Firestore (Google Cloud)
  // Substitua com as chaves do Console do Firebase da sua ONG (https://console.firebase.google.com/)
  firebase: {
    apiKey: "AIzaSyD1YD_Bnq5BdMev00EOzIoxoon5gPcsd1o",
    authDomain: "maos-que-cuidam-5b73e.firebaseapp.com",
    projectId: "maos-que-cuidam-5b73e",
    storageBucket: "maos-que-cuidam-5b73e.firebasestorage.app",
    messagingSenderId: "981758913431",
    appId: "1:981758913431:web:5f96a31f4ffc45c9e772d2"
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
