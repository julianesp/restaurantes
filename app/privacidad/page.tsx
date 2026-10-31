import Link from "next/link";
import LegalPage, { LegalIdentity } from "@/components/legal/LegalPage";
import { LEGAL, LEGAL_WHATSAPP_URL } from "@/lib/legal";

export const metadata = {
  title: "Política de tratamiento de datos personales · Brasaya",
  description: "Cómo Brasaya recoge, usa y protege los datos personales, conforme a la Ley 1581 de 2012.",
};

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de tratamiento de datos personales">
      <p>
        Esta política explica cómo Brasaya recoge, usa, guarda y protege los datos personales, en cumplimiento de la Ley
        Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y las demás normas
        colombianas de protección de datos.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <LegalIdentity />

      <h2>2. Dos tipos de titulares, dos papeles distintos</h2>
      <ul>
        <li>
          <strong>Restaurantes y sus usuarios</strong> (dueños, administradores, meseros): Brasaya es el <em>responsable</em> de
          sus datos.
        </li>
        <li>
          <strong>Clientes de cada restaurante</strong> (quien hace un pedido, una reserva o deja una sugerencia en el sitio de un
          restaurante): el <em>responsable</em> es ese restaurante y Brasaya actúa como <em>encargado</em>, es decir, trata los
          datos por cuenta del restaurante y solo para prestarle el servicio. Para ejercer sus derechos sobre esos datos, el
          cliente puede dirigirse al restaurante o a Brasaya, que trasladará la solicitud.
        </li>
      </ul>

      <h2>3. Qué datos tratamos</h2>
      <ul>
        <li><strong>Del restaurante y sus usuarios:</strong> nombre, correo, teléfono, datos del negocio (nombre, dirección, logo, redes), nombre y correo de los meseros, pagos de la suscripción (referencia, valor, fecha y medio de pago).</li>
        <li><strong>De los clientes del restaurante:</strong> nombre, teléfono, correo cuando se pide, dirección y barrio de entrega, contenido del pedido o la reserva, notas y sugerencias.</li>
        <li><strong>Datos técnicos:</strong> dirección IP y datos del navegador, usados para seguridad (por ejemplo, para limitar intentos de PIN) y para el funcionamiento del sitio.</li>
      </ul>
      <p>
        <strong>No guardamos datos de tarjetas ni de cuentas bancarias.</strong> Los pagos los procesa ePayco directamente. No
        pedimos datos sensibles ni recogemos a sabiendas datos de menores de edad.
      </p>

      <h2>4. Para qué los usamos</h2>
      <ul>
        <li>Crear y administrar la cuenta del restaurante y dar acceso a sus usuarios.</li>
        <li>Prestar el servicio: mostrar el sitio y el menú, recibir y gestionar pedidos, reservas y mesas, y avisar al restaurante (Telegram, WhatsApp, correo).</li>
        <li>Cobrar la suscripción, emitir comprobantes y cumplir obligaciones contables y tributarias.</li>
        <li>Dar soporte y enviar avisos sobre el servicio (vencimientos, cambios, seguridad).</li>
        <li>Prevenir fraudes y accesos no autorizados.</li>
        <li>Elaborar estadísticas agregadas, sin identificar a las personas, para mejorar la plataforma.</li>
      </ul>
      <p>No vendemos ni alquilamos datos personales. Los datos de los clientes de un restaurante no se usan para fines de otros restaurantes ni de Brasaya.</p>

      <h2>5. Autorización</h2>
      <p>
        Al registrarse en Brasaya, el restaurante autoriza el tratamiento descrito aquí. Los clientes de cada restaurante dan su
        autorización al restaurante al enviar sus datos en el sitio; el restaurante, como responsable, debe tener su propia
        política o adoptar esta en lo que le aplique.
      </p>

      <h2>6. Con quién compartimos los datos</h2>
      <p>Solo con proveedores que necesitamos para prestar el servicio, que actúan como encargados y deben protegerlos:</p>
      <ul>
        <li><strong>Cloudflare</strong> (alojamiento, base de datos y archivos).</li>
        <li><strong>Clerk</strong> (inicio de sesión de los usuarios del restaurante).</li>
        <li><strong>ePayco</strong> (pagos de la suscripción y, cuando el restaurante lo conecta, pagos de sus clientes).</li>
        <li><strong>Meta (WhatsApp)</strong> y <strong>Telegram</strong> (avisos al restaurante, cuando los activa).</li>
      </ul>
      <p>
        Algunos de estos proveedores guardan datos fuera de Colombia, principalmente en Estados Unidos. Estas transferencias se
        hacen a proveedores con estándares adecuados de protección y para las finalidades descritas. También entregaremos
        datos a autoridades cuando una norma o una orden lo exija.
      </p>

      <h2>7. Derechos de los titulares</h2>
      <p>Conforme al artículo 8 de la Ley 1581 de 2012, toda persona puede:</p>
      <ul>
        <li>conocer, actualizar y rectificar sus datos;</li>
        <li>pedir prueba de la autorización que dio;</li>
        <li>ser informada sobre el uso que se da a sus datos;</li>
        <li>revocar la autorización o pedir que se borren sus datos, cuando no exista un deber legal o contractual de conservarlos;</li>
        <li>acceder gratis a sus datos;</li>
        <li>presentar quejas ante la Superintendencia de Industria y Comercio (SIC) después de agotar el trámite con nosotros.</li>
      </ul>

      <h2>8. Cómo ejercerlos</h2>
      <p>
        Escríbanos por{" "}
        <a href={LEGAL_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp ({LEGAL.whatsappLabel})</a>
        {LEGAL.email && <> o al correo <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></>}, indicando su nombre, cómo
        contactarlo, el restaurante relacionado (si aplica) y lo que solicita.
      </p>
      <ul>
        <li><strong>Consultas:</strong> se responden en máximo 10 días hábiles, prorrogables 5 días hábiles más avisando el motivo.</li>
        <li>
          <strong>Reclamos</strong> (corrección, actualización, supresión o incumplimiento): se responden en máximo 15 días
          hábiles, prorrogables 8 días hábiles más avisando el motivo. Si el reclamo está incompleto, pediremos la información
          faltante dentro de los 5 días siguientes.
        </li>
      </ul>

      <h2>9. Seguridad</h2>
      <p>
        Usamos conexiones cifradas (HTTPS), separación de los datos de cada restaurante, cifrado de las llaves de pago, PIN de
        meseros guardados con hash, límites de intentos y acceso restringido al panel. Ningún sistema es infalible: si ocurre un
        incidente que afecte datos personales, lo informaremos a los afectados y a la SIC según la ley.
      </p>

      <h2>10. Cookies y almacenamiento del navegador</h2>
      <p>
        Usamos cookies de sesión para el inicio de sesión del panel y el almacenamiento del navegador para recordar el carrito,
        el tema claro u oscuro y la sesión del mesero. No usamos cookies de publicidad.
      </p>

      <h2>11. Conservación</h2>
      <p>
        Conservamos los datos mientras el restaurante use el servicio y durante 90 días después de su terminación, salvo lo que
        la ley exija guardar por más tiempo (por ejemplo, información contable). Ver también los{" "}
        <Link href="/terminos">Términos y condiciones</Link>.
      </p>

      <h2>12. Vigencia y cambios</h2>
      <p>
        Esta política rige desde el {LEGAL.updatedLabel}. Los cambios importantes se publicarán en esta página y se avisarán a
        los restaurantes antes de aplicarse.
      </p>
    </LegalPage>
  );
}
