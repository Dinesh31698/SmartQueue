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
  switch (status) {
    case 'WAITING':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'CALLED':
      return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
    case 'PROCESSING':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'SKIPPED':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};
