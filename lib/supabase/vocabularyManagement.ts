// Re-export all functions from the modular files for backward compatibility
export {
  createVocabularyList,
  getAllVocabularyLists,
  getVocabularyListById,
  updateVocabularyList,
  deleteVocabularyList,
  getVocabularyListWords,
} from './vocabularyLists';

export {
  addVocabularyCard,
  updateVocabularyCard,
  deleteVocabularyCard,
  reorderVocabularyCards,
} from './vocabularyCards';

export {
  createGameLink,
  getAllGameLinks,
  getGameLinkByCode,
  updateGameLink,
  deleteGameLink,
} from './gameLinks';
