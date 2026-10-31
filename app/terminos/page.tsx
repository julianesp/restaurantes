import Link from "next/link";
import LegalPage, { LegalIdentity } from "@/components/legal/LegalPage";
import { GRACE_DAYS, MONTHLY_PRICE_LABEL, TRIAL_DAYS } from "@/lib/billing";

export const metadata = {
  title: "Términos y condiciones · Brasaya",
  description: "Condiciones de uso de Brasaya, la plataforma para restaurantes.",
};

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones de Brasaya">
      <p>
        Estos términos regulan el uso de Brasaya (brasaya.com y sus subdominios), una plataforma de software que permite a
        restaurantes tener su sitio web, menú en línea, pedidos por QR, panel de cocina y meseros, y otras herramientas. Al crear
        una cuenta o usar la plataforma, usted acepta estos términos y la{" "}
        <Link href="/privacidad">Política de tratamiento de datos personales</Link>.
      </p>

      <h2>1. Quién presta el servicio</h2>
      <LegalIdentity />

      <h2>2. Definiciones</h2>
      <ul>
        <li><strong>Restaurante:</strong> la persona natural o jurídica que crea una cuenta en Brasaya para su negocio.</li>
        <li><strong>Usuarios del restaurante:</strong> dueños, administradores y meseros a los que el restaurante da acceso.</li>
        <li><strong>Clientes:</strong> las personas que visitan el sitio del restaurante, hacen pedidos o reservas.</li>
      </ul>

      <h2>3. Cuenta y registro</h2>
      <ul>
        <li>Quien registra el restaurante declara ser mayor de edad y tener facultad para representarlo.</li>
        <li>La información del registro debe ser veraz y mantenerse actualizada.</li>
        <li>
          El restaurante es responsable de las acciones hechas con sus cuentas, incluidos los PIN de sus meseros, y debe
          avisarnos de inmediato si sospecha un acceso no autorizado.
        </li>
      </ul>

      <h2>4. Prueba gratis, precio y pagos de la suscripción</h2>
      <ul>
        <li>Cada restaurante nuevo tiene {TRIAL_DAYS} días de prueba gratis, sin tarjeta de crédito.</li>
        <li>
          Después, el servicio cuesta {MONTHLY_PRICE_LABEL} COP por mes, pagado por anticipado a través de ePayco. El precio
          vigente se publica en brasaya.com; si cambia, se avisa con al menos 30 días de anticipación y aplica desde el siguiente
          periodo.
        </li>
        <li>No hay cobros automáticos: cada pago suma un mes de servicio desde el final del periodo vigente.</li>
        <li>
          Si el periodo vence sin pago, el sitio sigue en línea {GRACE_DAYS} días con avisos. Después se suspende el sitio público
          y el panel hasta que se pague; los datos se conservan según la sección 10.
        </li>
        <li>
          Los meses ya iniciados no se reembolsan, salvo cuando la ley lo exija o cuando la falla del servicio sea atribuible a
          Brasaya.
        </li>
      </ul>

      <h2>5. Pagos de los clientes del restaurante</h2>
      <p>
        Los pagos en línea que hacen los clientes (pedidos, reservas) se procesan con la <strong>cuenta de ePayco del propio
        restaurante</strong>, que este conecta en su panel. El dinero va directamente a esa cuenta: Brasaya no lo recibe, no lo
        administra y no cobra comisión sobre las ventas. En consecuencia:
      </p>
      <ul>
        <li>La relación de compraventa es entre el restaurante y su cliente. Brasaya no es parte de ella.</li>
        <li>
          El restaurante es responsable de sus precios, productos, domicilios, información sobre alérgenos, facturación,
          impuestos, devoluciones, garantías y atención de reclamos de sus clientes.
        </li>
        <li>El restaurante se rige además por los términos de ePayco para su cuenta.</li>
        <li>Si el restaurante no conecta una cuenta de ePayco, los pedidos y reservas se envían a su WhatsApp.</li>
      </ul>

      <h2>6. Contenido del restaurante</h2>
      <p>
        El restaurante conserva los derechos sobre su nombre, logo, fotos, textos y menú, y nos autoriza a alojarlos y mostrarlos
        en la plataforma mientras use el servicio. Declara que tiene derecho a usar ese contenido y que no infringe derechos de
        terceros.
      </p>

      <h2>7. Uso aceptable</h2>
      <p>No está permitido usar Brasaya para:</p>
      <ul>
        <li>vender productos ilegales o publicar contenido ilícito, engañoso u ofensivo;</li>
        <li>enviar mensajes no solicitados o usar los datos de los clientes para fines distintos a los que estos autorizaron;</li>
        <li>intentar acceder a datos de otros restaurantes, vulnerar la seguridad o sobrecargar la plataforma;</li>
        <li>copiar, revender o sublicenciar el software sin autorización.</li>
      </ul>
      <p>Brasaya puede suspender una cuenta que incumpla estas reglas, avisando al restaurante cuando sea posible.</p>

      <h2>8. Datos personales</h2>
      <p>
        Brasaya trata los datos de los restaurantes y sus usuarios como <strong>responsable</strong>, y los datos de los clientes
        de cada restaurante como <strong>encargado</strong>, por cuenta y bajo las instrucciones del restaurante, que es su
        responsable. El restaurante debe obtener la autorización de sus clientes cuando la ley lo exija. El detalle está en la{" "}
        <Link href="/privacidad">Política de tratamiento de datos personales</Link>.
      </p>

      <h2>9. Disponibilidad y soporte</h2>
      <p>
        Trabajamos para que la plataforma esté disponible todo el tiempo, pero puede haber interrupciones por mantenimiento,
        fallas de proveedores (alojamiento, ePayco, WhatsApp, Telegram) o causas fuera de nuestro control. El soporte se presta en
        español por WhatsApp en horario hábil.
      </p>

      <h2>10. Terminación y conservación de datos</h2>
      <ul>
        <li>El restaurante puede dejar de usar Brasaya en cualquier momento; basta con no renovar el pago.</li>
        <li>
          Tras la suspensión o terminación, conservamos los datos del restaurante durante 90 días para que pueda reactivarse o
          pedir una copia. Después pueden eliminarse, salvo lo que la ley obligue a conservar.
        </li>
        <li>El restaurante puede solicitar la eliminación anticipada de su cuenta y sus datos por los canales de contacto.</li>
      </ul>

      <h2>11. Responsabilidad</h2>
      <p>
        Brasaya responde por los daños directos que cause por su culpa en la prestación del servicio, hasta el valor pagado por
        el restaurante en los tres meses anteriores al hecho, salvo dolo o culpa grave, o cuando la ley no permita esta
        limitación. Brasaya no responde por las ventas, productos o servicios del restaurante, ni por fallas de terceros como
        ePayco, Meta (WhatsApp) o Telegram.
      </p>

      <h2>12. Cambios a estos términos</h2>
      <p>
        Podemos actualizar estos términos. Los cambios importantes se avisan en el panel o por los datos de contacto del
        restaurante con al menos 15 días de anticipación. Seguir usando el servicio después de esa fecha implica aceptarlos.
      </p>

      <h2>13. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República de Colombia, incluidas la Ley 527 de 1999 (comercio electrónico) y,
        cuando aplique, la Ley 1480 de 2011 (Estatuto del Consumidor). Las diferencias se intentarán resolver primero de forma
        directa por los canales de contacto.
      </p>
    </LegalPage>
  );
}
