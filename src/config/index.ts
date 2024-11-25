import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT,
  Mongodb_url: process.env.MONGODB_DATABASE_URI,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  default_password: process.env.DEFAULT_PASSWORD,
};
