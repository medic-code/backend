/* eslint-disable max-len */
import express from 'express';
import words from '../services/words';
import { Word, UserWord } from '../types';

const router = express.Router();

router.get('/', async(_req, res): Promise<void> => {
  const allWords: Array<Word> = await words.getAll();

  res.json(allWords);
});


router.get('/:id', async(req, res): Promise<void> => {
  const id = Number(req.params.id);
  const wordById: Word = await words.getById(id);

  res.json(wordById);
});


router.get('/:langId/user/:userId', async(req, res): Promise<void> => {
  const { langId, userId } = req.params;
  const wordsByLanguageAndUser: Array<Word> = await words.getByLanguageAndUser(langId, Number(userId));

  res.json(wordsByLanguageAndUser);
});


router.get('/text/:textId/:langId/user/:userId', async(req, res): Promise<void> => {
  const { textId, langId, userId } = req.params;

  const userwordsInText: Array<UserWord> = await words.getUserwordsInText(Number(userId), Number(textId), langId, true);
  res.json(userwordsInText);
});


router.post('/user/:userId', async(req, res): Promise<void> => {
  const wordData: Word = req.body;
  const userId: number = Number(req.params.userId);
  const newWord: Word | null = await words.addNew(wordData);

  if (newWord.id) {
    const newStatus = await words.addStatus(newWord.id, userId, 'learning');

    res.status(201).json({ ...newWord, status: newStatus });
  }
});


router.put('/:wordId/user/:userId', async(req, res): Promise<void> => {
  const { status } = req.body;
  const { wordId, userId } = req.params;
  const updatedStatus: string | null = await words.updateStatus(Number(wordId), Number(userId), status);

  res.send(updatedStatus);
});

router.delete('/:wordId', async(req, res): Promise<void> => {
  const id = req.params.wordId;
  const result = await words.remove(Number(id));

  res.status(204).json(result);
});

export default router;
