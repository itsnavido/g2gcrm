import { getStatusColor } from '../utils/formatters';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  
  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};

export default StatusBadge;

