// components/Register/SelectionCard.tsx

interface Props {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}

export default function SelectionCard({ selected, onClick, label, description }: Props) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border rounded-xl p-4 text-center transition-all select-none
        ${selected ? 'border-primary-purple-200 bg-primary-purple-100/10' : 'border-line-200'}
        hover:shadow-md`}
    >
      <div className="text-body font-semibold mb-1 text-font-100">{label}</div>
      {description && <div className="text-caption text-font-200">{description}</div>}
    </div>
  );
}
