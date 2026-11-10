"use client";

import KitchenChat from "@/components/KitchenChat";
import { useKitchenStaff } from "@/components/kitchen/KitchenStaff";

export default function CocinaChatPage() {
  const { name } = useKitchenStaff();
  return <KitchenChat mode="staff" role="chef" name={name} />;
}
