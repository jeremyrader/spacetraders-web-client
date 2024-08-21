'use client';

interface MapButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  text: string;
  isSelected?: boolean;
}

const MapButton = ({ onClick, text, isSelected = false }: MapButtonProps) => {
  const buttonClass = `
    px-4 py-2
    rounded 
    ${isSelected ? 'bg-blue-900' : 'bg-blue-700'}
    hover:bg-blue-800
    click:bg-blue-900
    text-lg font-semibold 
    text-white 
    tracking-wide 
    uppercase 
    transition-colors 
    duration-300
    mb-2
  `;

  return (
    <button onClick={onClick} type="button" className={buttonClass}>
      {text}
    </button>
  );
};

export default MapButton;
