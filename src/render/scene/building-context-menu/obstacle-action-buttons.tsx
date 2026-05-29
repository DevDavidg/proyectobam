type ObstacleActionButtonsProps = {
  canRecycleObstacle: boolean;
  handleRecycleObstacle: () => void;
};

export const ObstacleActionButtons = ({
  canRecycleObstacle,
  handleRecycleObstacle,
}: ObstacleActionButtonsProps) => {
  const handleRecycleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRecycleObstacle();
    }
  };

  return (
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
  );
};
