export const getSavedgameIds = () => {
  const savedgameIds = localStorage.getItem('saved_games')
    ? JSON.parse(localStorage.getItem('saved_games'))
    : [];

  return savedgameIds;
};

export const savegameIds = (gameIdArr) => {
  if (gameIdArr.length) {
    localStorage.setItem('saved_games', JSON.stringify(gameIdArr));
  } else {
    localStorage.removeItem('saved_games');
  }
};

export const removeGameId = (gameId) => {
  const savedgameIds = localStorage.getItem('saved_games')
    ? JSON.parse(localStorage.getItem('saved_games'))
    : null;

  if (!savedgameIds) {
    return false;
  }

  const updatedsavedgameIds = savedgameIds?.filter((saveGameIds) => saveGameIds !== gameId);
  localStorage.setItem('saved_games', JSON.stringify(updatedsavedgameIds));

  return true;
};
