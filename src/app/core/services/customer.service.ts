import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer } from '../../shared/models/customer.model';

/**
 * Servicio encargado de gestionar las operaciones CRUD de clientes en Firestore.
 * Aplica conversiones explícitas entre los Timestamps de Firestore y objetos Date de JavaScript.
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly collectionName = 'customers';

  constructor(private readonly firestore: Firestore) {}

  /**
   * Obtiene la lista de todos los clientes en tiempo real.
   * Convierte explícitamente los campos Timestamp de Firestore a Date en la lectura.
   * 
   * @returns Un Observable con la lista de clientes.
   */
  getCustomers(): Observable<Customer[]> {
    const customersCollection = collection(this.firestore, this.collectionName);
    // collectionData obtiene los documentos y sus IDs si le pasamos { idField: 'id' }
    return collectionData(customersCollection, { idField: 'id' }).pipe(
      map((data: any[]) => data.map(docData => this.mapToCustomer(docData, docData.id)))
    );
  }

  /**
   * Agrega un nuevo cliente a la colección de Firestore.
   * Convierte explícitamente los campos Date a Timestamp de Firestore al escribir.
   * 
   * @param customer El objeto cliente sin el ID.
   * @returns Una promesa que se resuelve al finalizar la inserción.
   */
  addCustomer(customer: Omit<Customer, 'id'>): Promise<void> {
    const customersCollection = collection(this.firestore, this.collectionName);
    const firestoreData = this.mapToFirestore(customer);
    return addDoc(customersCollection, firestoreData).then(() => {});
  }

  /**
   * Actualiza los datos de un cliente existente.
   * Realiza la conversión de Date a Timestamp para los campos de fecha provistos.
   * 
   * @param id El identificador del documento en Firestore.
   * @param customer Los campos parciales del cliente a actualizar.
   * @returns Una promesa que se resuelve al finalizar la actualización.
   */
  updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const updateData: any = { ...customer };
    
    // Eliminamos ID por seguridad si se pasa en el payload
    delete updateData.id;

    if (customer.fechaNacimiento) {
      updateData.fechaNacimiento = Timestamp.fromDate(customer.fechaNacimiento);
    }
    if (customer.createdAt) {
      updateData.createdAt = Timestamp.fromDate(customer.createdAt);
    }

    return updateDoc(docRef, updateData);
  }

  /**
   * Elimina un cliente de Firestore.
   * 
   * @param id El identificador del documento en Firestore.
   * @returns Una promesa que se resuelve al finalizar la eliminación.
   */
  deleteCustomer(id: string): Promise<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(docRef);
  }

  /**
   * Mapea los datos provenientes de Firestore al modelo Customer local,
   * convirtiendo los Timestamps a instancias Date de JavaScript.
   */
  private mapToCustomer(data: any, id: string): Customer {
    return {
      id,
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      edad: typeof data.edad === 'number' ? data.edad : 0,
      fechaNacimiento: data.fechaNacimiento instanceof Timestamp 
        ? data.fechaNacimiento.toDate() 
        : (data.fechaNacimiento ? new Date(data.fechaNacimiento) : new Date()),
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate() 
        : (data.createdAt ? new Date(data.createdAt) : undefined),
      createdBy: data.createdBy || undefined
    };
  }

  /**
   * Mapea un objeto Customer local a la estructura requerida por Firestore,
   * convirtiendo fechas Date a Timestamps.
   */
  private mapToFirestore(customer: Omit<Customer, 'id'>): any {
    return {
      nombre: customer.nombre,
      apellido: customer.apellido,
      edad: customer.edad,
      fechaNacimiento: Timestamp.fromDate(customer.fechaNacimiento),
      createdAt: customer.createdAt ? Timestamp.fromDate(customer.createdAt) : Timestamp.now(),
      createdBy: customer.createdBy || ''
    };
  }
}
