/**
 * Identificación de Brasaya en los documentos legales (/terminos, /privacidad) y contacto comercial.
 * La Ley 1581 de 2012 exige identificar al responsable del tratamiento: completa los campos vacíos
 * (razón social o nombre del titular, NIT o cédula, dirección y correo). Los vacíos no se muestran.
 */
export const LEGAL = {
  brand: "Brasaya",
  /** Razón social o nombre completo de la persona natural titular del negocio */
  legalName: "",
  /** NIT o cédula */
  taxId: "",
  /** Dirección de notificación */
  address: "",
  /** Correo para consultas y reclamos de datos personales */
  email: "",
  whatsapp: "573174503604",
  whatsappLabel: "+57 317 450 3604",
  /** Versión vigente de los documentos (se guarda al aceptar los términos en /registro) */
  version: "2026-10-30",
  updatedLabel: "30 de octubre de 2026",
};

export const LEGAL_WHATSAPP_URL = `https://wa.me/${LEGAL.whatsapp}?text=${encodeURIComponent("Hola, tengo una consulta sobre Brasaya.")}`;
