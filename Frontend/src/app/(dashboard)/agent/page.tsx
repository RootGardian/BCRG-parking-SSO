import { redirect } from "next/navigation";

/**
 * Route racine Agent (`/agent`) redirigeant automatiquement vers `/agent/mouvement-personnel`.
 */
export default function AgentRootPage() {
  redirect("/agent/mouvement-personnel");
}
