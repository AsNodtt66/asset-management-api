-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordExp" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;
