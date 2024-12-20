import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import AppError from '../../error/AppError';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../students/students.interface';
import { Student } from '../students/students.schema';
import { TUser } from './user.interface';
import { User } from './user.model';
import {
  generateAdminId,
  generateFacultyId,
  generateStudentId,
} from './user.utils';
import mongoose from 'mongoose';
import { TAdmin } from '../Admin/admin.interface';
import { Admin } from '../Admin/admin.model';
import { TFaculty } from '../faculty/faculty.interface';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { Faculty } from '../faculty/faculty.model';

const createStudentToDB = async (password: string, payload: TStudent) => {
  // create user object :
  const userData: Partial<TUser> = {};
  // password  is given by user or not :
  userData.password = password || (config.default_password as string);

  // role :
  userData.role = 'student';

  // find academic semester info :
  const academicSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );

  if (!academicSemester) {
    throw new AppError('Academic semester not found', StatusCodes.NOT_FOUND);
  }

  // created isolated environment :
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // set generated id :
    userData.id = await generateStudentId(academicSemester);

    // create a user : (transaction -1)
    const newUser = await User.create([userData], { session });

    // check user is created or not :
    if (!newUser.length) {
      throw new AppError('Failed to create user', StatusCodes.BAD_REQUEST);
    }
    // set student id and user id :
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id;

    // create a student : (transaction -2)
    const newStudent = await Student.create([payload], { session });

    if (!newStudent.length) {
      throw new AppError('Failed to create student', StatusCodes.BAD_REQUEST);
    }

    // commit transaction if everything is good :
    await session.commitTransaction();
    await session.endSession();

    return newStudent;
  } catch (error) {
    // rollback transaction if something went wrong :
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(error as string, StatusCodes.BAD_REQUEST);
  }
};

const createFacultyToDB = async (password: string, payload: TFaculty) => {
  // create user object :
  const userData: Partial<TUser> = {};

  // check password is given or not :
  userData.password = password || (config.default_password as string);

  // set role :
  userData.role = 'faculty';

  // find academic department info :
  const academicDepartment = await AcademicDepartment.findById(
    payload.academicDepartment,
  );

  if (!academicDepartment) {
    throw new AppError('Academic department not found', StatusCodes.NOT_FOUND);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // set generated id :
    userData.id = await generateFacultyId();

    // create a user : (transaction -1)
    const newUser = await User.create([userData], { session });

    if (!newUser.length) {
      throw new AppError('Failed to create user', StatusCodes.BAD_REQUEST);
    }

    // set id and user id :
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference id

    // create a faculty : (transaction -2)
    const newFaculty = await Faculty.create([payload], { session });

    if (!newFaculty.length) {
      throw new AppError('Failed to create faculty', StatusCodes.BAD_REQUEST);
    }

    // commit transaction if everything is good :
    await session.commitTransaction();
    await session.endSession();

    return newFaculty;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(error as string, StatusCodes.BAD_REQUEST);
  }
};

const createAdminIntoDB = async (password: string, payload: TAdmin) => {
  // create user object :
  const userData: Partial<TUser> = {};

  // check password is given or not :
  userData.password = password || (config.default_password as string);

  // set role :
  userData.role = 'admin';

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // set generated id :
    userData.id = await generateAdminId();

    // create a user : (transaction -1)
    const newUser = await User.create([userData], { session });

    if (!newUser.length) {
      throw new AppError('Failed to create user', StatusCodes.BAD_REQUEST);
    }

    // set id and user id :
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference id

    // create a admin : (transaction -2)
    const newAdmin = await Admin.create([payload], { session });

    if (!newAdmin.length) {
      throw new AppError('Failed to create admin', StatusCodes.BAD_REQUEST);
    }

    // commit transaction if everything is good :
    await session.commitTransaction();
    await session.endSession();

    return newAdmin;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(error as string, StatusCodes.BAD_REQUEST);
  }
};

export const UserService = {
  createStudentToDB,
  createFacultyToDB,
  createAdminIntoDB,
};
