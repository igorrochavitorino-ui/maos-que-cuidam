import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, getDocs, collection, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  public isFirebaseConfigured = false;

  constructor() {
    this.initFirebase();
  }

  private initFirebase(): void {
    try {
      if (environment.firebase && environment.firebase.apiKey && !environment.firebase.apiKey.includes('SUA_CHAVE_API_FIREBASE')) {
        if (!getApps().length) {
          this.app = initializeApp(environment.firebase);
        } else {
          this.app = getApps()[0];
        }
        this.db = getFirestore(this.app);
        this.isFirebaseConfigured = true;
        console.log('🔥 [Firebase/Firestore] Conectado com sucesso à nuvem do Google!');
      } else {
        console.log('ℹ️ [Firebase/Firestore] Chave de demonstração ativa. Os dados estão sendo salvos com segurança no Armazenamento Local.');
      }
    } catch (err) {
      console.warn('⚠️ [Firebase] Inicialização operando em modo offline/local:', err);
    }
  }

  /**
   * Salva ou atualiza um documento no Firestore
   */
  async saveDocument(collectionName: string, id: string, data: any): Promise<boolean> {
    if (!this.db || !this.isFirebaseConfigured) {
      return false;
    }
    try {
      // Sanitiza dados para remover qualquer chave com valor 'undefined' (que o Firestore proíbe e rejeita)
      const cleanData = JSON.parse(JSON.stringify(data));
      const docRef = doc(this.db, collectionName, id);
      await setDoc(docRef, {
        ...cleanData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`✅ [Firestore Cloud] Documento ${id} sincronizado na coleção '${collectionName}'`);
      return true;
    } catch (err) {
      console.error(`❌ [Firestore Cloud] Erro ao salvar na coleção ${collectionName}:`, err);
      return false;
    }
  }

  /**
   * Busca todos os documentos de uma coleção no Firestore
   * Retorna null em caso de falha de conexão/permissão, ou array (mesmo que vazio []) com os documentos
   */
  async getCollectionData(collectionName: string): Promise<any[] | null> {
    if (!this.db || !this.isFirebaseConfigured) {
      return null;
    }
    try {
      const colRef = collection(this.db, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error(`❌ [Firestore Cloud] Erro ao buscar documentos de ${collectionName}:`, err);
      return null;
    }
  }

  /**
   * Escuta alterações em tempo real de uma coleção no Firestore.
   * Quando qualquer cliente ou admin criar, editar ou excluir dados, o callback é chamado instantaneamente.
   */
  listenToCollection(collectionName: string, callback: (data: any[]) => void): Unsubscribe {
    if (!this.db || !this.isFirebaseConfigured) {
      return () => {};
    }
    try {
      const colRef = collection(this.db, collectionName);
      return onSnapshot(colRef, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(items);
      }, (err) => {
        console.warn(`⚠️ [Firestore Realtime] Aviso no listener de '${collectionName}':`, err);
      });
    } catch (err) {
      console.warn(`⚠️ [Firestore Realtime] Falha ao registrar listener em '${collectionName}':`, err);
      return () => {};
    }
  }

  /**
   * Remove um documento no Firestore
   */
  async deleteDocument(collectionName: string, id: string): Promise<boolean> {
    if (!this.db || !this.isFirebaseConfigured) {
      return false;
    }
    try {
      const docRef = doc(this.db, collectionName, id);
      await deleteDoc(docRef);
      console.log(`🗑️ [Firestore Cloud] Documento ${id} removido da coleção '${collectionName}'`);
      return true;
    } catch (err) {
      console.error(`❌ [Firestore Cloud] Erro ao remover documento ${id} em ${collectionName}:`, err);
      return false;
    }
  }
}
