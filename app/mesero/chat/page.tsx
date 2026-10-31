"use client";

import KitchenChat from "@/components/KitchenChat";
import { useWaiterSession } from "@/components/mesero/WaiterSession";

export default function MeseroChatPage() {
  const { session, logout } = useWaiterSession();
  // Si el token vence (12 h) o el mesero fue desactivado, se vuelve a pedir el PIN
  return <KitchenChat mode="waiter" waiterName={session.name} token={session.token} onExpired={logout} />;
}
