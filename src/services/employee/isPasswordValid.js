import bcrypt from "bcryptjs";

const isPasswordValid = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export { isPasswordValid };
