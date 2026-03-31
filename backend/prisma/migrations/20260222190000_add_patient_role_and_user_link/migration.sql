-- AlterEnum (run outside transaction if PG < 11)
ALTER TYPE "UserRole" ADD VALUE 'PATIENT';

-- AlterTable Patient: add userId
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "patients_userId_key" ON "patients"("userId");

-- AddForeignKey (after the column exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'patients_userId_fkey'
  ) THEN
    ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
