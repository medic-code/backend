import boom from '@hapi/boom';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userData from '../data-access/users';
import { UserDB, LoggedInUser } from '../types';


const verifyLoginDetails = async function (email: string, password: string): Promise<UserDB> {
  const result = await userData.getUserByEmail(email);

  const user: UserDB | null = result.rowCount > 0 ? result.rows[0] : null;

  const passwordsMatch: boolean = user
    ? await bcrypt.compare(password, user.password_hash)
    : false;

  if (!(user && passwordsMatch)) {
    throw boom.unauthorized('invalid email or password');
  }

  return user;
};


const login = async function (email: string, password: string): Promise<LoggedInUser> {
  const verifiedUser: UserDB = await verifyLoginDetails(email, password);

  const userForToken = {
    email: verifiedUser.email,
    id: verifiedUser.id,
  };

  const token = jwt.sign(
    userForToken,
    String(process.env.SECRET),
    { expiresIn: 60 * 60 * 24 * 7 }, // token expires in one week
  );

  return {
    id: verifiedUser.id,
    email: verifiedUser.email,
    username: verifiedUser.username,
    currentKnownLanguageId: verifiedUser.current_known_language_id,
    currentLearnLanguageId: verifiedUser.current_learn_language_id,
    token,
  };
};


export default {
  login,
};
