import config from '../../config';
import { TStudent } from '../students/students.interface';
import { Student } from '../students/students.schema';
import { TUser } from './user.interface';
import { User } from './user.model';

const createStudentToDB = async (password: string, studentData: TStudent) => {
  try {
    // create user object :
    const userData: Partial<TUser> = {};

    // password  is given by user or not :
    userData.password = password || (config.default_password as string);

    // role :
    userData.role = 'student';
    // id :
    userData.id = '2025000001';

    // create a user :
    const newUser = await User.create(userData);

    // create a student :
    if (Object.keys(newUser).length) {
      studentData.id = newUser.id;
      studentData.user = newUser._id;

      const newStudent = await Student.create(studentData);
      return newStudent;
    }
  } catch (error) {
    console.log(error);
  }
};

export const UserService = {
  createStudentToDB,
};
