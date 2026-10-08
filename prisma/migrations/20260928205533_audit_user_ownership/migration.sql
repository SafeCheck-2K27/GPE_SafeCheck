-- AlterTable
ALTER TABLE "audits" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "guestSubject" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "audits_userId_idx" ON "audits"("userId");

-- CreateIndex
CREATE INDEX "audits_guestSubject_idx" ON "audits"("guestSubject");

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
