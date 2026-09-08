import type { Plan, PlanId } from "@/types";

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    limits: { tasksPerMonth: 100, projects: 2, ai: false },
  },
  pro: {
    id: "pro",
    name: "Pro",
    limits: { tasksPerMonth: 2000, projects: null, ai: false },
  },
  premium: {
    id: "premium",
    name: "Premium",
    limits: { tasksPerMonth: null, projects: null, ai: true },
  },
};

export const planUsage = (planId: PlanId, used: number) => {
  const limit = PLANS[planId].limits.tasksPerMonth;
  if (!limit) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
};
