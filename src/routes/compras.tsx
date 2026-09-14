import { createFileRoute } from "@tanstack/react-router";
import { ShoppingView } from "@/components/workspace/ShoppingView";
export const Route = createFileRoute("/compras")({ component: () => <ShoppingView /> });
