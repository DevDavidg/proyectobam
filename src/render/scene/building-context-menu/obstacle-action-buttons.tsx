type ObstacleActionButtonsProps = {
  canRecycleObstacle: boolean;
  handleRecycleObstacle: () => void;
  onOpenInfo: () => void;
};

export const ObstacleActionButtons = ({
  canRecycleObstacle,
  handleRecycleObstacle,
  onOpenInfo,
}: ObstacleActionButtonsProps) => {
  const handleRecycleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRecycleObstacle();
    }
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        tabIndex={0}
        aria-label="Ver informacion del obstaculo"
        className="ui-button w-full border-sky-600 bg-sky-800/80 px-2 py-1 text-sky-50"
        onClick={onOpenInfo}
      >
        Info
      </button>
    <button
      type="button"
      tabIndex={0}
      aria-label="Reciclar obstaculo"
      className={`ui-button w-full px-2 py-2 ${
        canRecycleObstacle ? 'border-rose-600 bg-rose-800/80 text-rose-50' : 'text-slate-500'
      }`}
      onClick={handleRecycleObstacle}
      onKeyDown={handleRecycleKeyDown}
      disabled={!canRecycleObstacle}
    >
      Reciclar
    </button>
    </div>
  );
};
