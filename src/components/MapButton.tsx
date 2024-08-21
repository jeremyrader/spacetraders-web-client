'use client'

interface MapButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  text: string
}

const MapButton = ({onClick, text}: MapButtonProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="
        px-4 py-2
        rounded 
        bg-blue-700
        hover:bg-blue-800
        click:bg-blue-900
        text-lg font-semibold 
        text-white 
        tracking-wide 
        uppercase 
        transition-colors 
        duration-300
        mb-2
      "
    >
      {text}
    </button>
  )
}

export default MapButton