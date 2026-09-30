import { Users, Package, Heart, MessageSquare } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalAnnouncements: number;
  totalDonations: number;
  totalManifestations: number;
  pendingModeration: number;
  activeAnnouncements: number;
}

interface StatsCardsProps {
  stats: Stats;
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString("pt-BR")}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Usuários"
        value={stats.totalUsers}
        icon={<Users size={22} className="text-blue-600" />}
        color="bg-blue-50"
      />
      <StatCard
        label="Anúncios ativos"
        value={stats.activeAnnouncements}
        icon={<Package size={22} className="text-emerald-600" />}
        color="bg-emerald-50"
      />
      <StatCard
        label="Doações realizadas"
        value={stats.totalDonations}
        icon={<Heart size={22} className="text-red-500" />}
        color="bg-red-50"
      />
      <StatCard
        label="Pendentes moderação"
        value={stats.pendingModeration}
        icon={<MessageSquare size={22} className="text-amber-600" />}
        color="bg-amber-50"
      />
    </div>
  );
}
