/*
  Warnings:

  - You are about to drop the column `ageGroup` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `guardianName` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `guardianPhone` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `phoneAlt` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "ageGroup",
DROP COLUMN "guardianName",
DROP COLUMN "guardianPhone",
DROP COLUMN "phoneAlt";
