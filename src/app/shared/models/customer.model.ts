/**
 * Interfaz que representa un cliente en la aplicación.
 * Mapeada localmente usando el tipo Date para fechas.
 */
export interface Customer {
  /** Identificador único generado por Firestore */
  id?: string;
  /** Nombre del cliente */
  nombre: string;
  /** Apellido del cliente */
  apellido: string;
  /** Edad calculada del cliente */
  edad: number;
  /** Fecha de nacimiento */
  fechaNacimiento: Date;
  /** Fecha de creación del registro */
  createdAt?: Date;
  /** Identificador único del usuario creador */
  createdBy?: string;
}
