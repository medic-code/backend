import boom from '@hapi/boom';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userData from '../data-access/users';
import users from './users';
import {
  UserDB,
  LoggedInUser,
  User,
  convertUserTypes,
} from '../types';


const verifyLoginDetails = async function (email: string, password: string): Promise<UserDB> {
  const result = await userData.getByEmail(email);

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
  const verifiedUserResult: UserDB = await verifyLoginDetails(email, password);

  const verifiedUser: User = convertUserTypes(verifiedUserResult);

  console.log(verifiedUser);
  users.addLanguages(verifiedUser);

  const sanitizedUser = users.sanitizeUser(verifiedUser);

  const userForToken = {
    email: verifiedUser.email,
    id: verifiedUser.id,
  };

  const token = jwt.sign(
    userForToken,
    String(process.env.SECRET),
    { expiresIn: 60 * 60 * 24 * 7 }, // token expires in one week
  );

  const loggedInUser: LoggedInUser = { ...sanitizedUser, token };

  return loggedInUser;
};


export default {
  login,
};
