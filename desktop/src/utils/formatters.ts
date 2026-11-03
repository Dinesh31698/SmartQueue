export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'WAITING':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'CALLED':
      return 'bg-[#007AB7]/20 text-[#38BDF8] border-[#007AB7]/50 shadow-glow-blue animate-pulse';
    case 'PROCESSING':
      return 'bg-[#FF2D95]/20 text-[#FF2D95] border-[#FF2D95]/50 shadow-glow-rose';
    case 'COMPLETED':
    case 'PAID':
    case 'OPEN':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'SKIPPED':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'CANCELLED':
    case 'CLOSED':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'PAUSED':
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    default:
      return 'bg-slate-800 text-slate-300 border-white/10';
  }
};