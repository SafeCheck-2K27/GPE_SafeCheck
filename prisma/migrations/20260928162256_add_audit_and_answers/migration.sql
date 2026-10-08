-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL,
    "guestSubject" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_answers" (
    "auditId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "audit_answers_pkey" PRIMARY KEY ("auditId","questionId")
);

-- AddForeignKey
ALTER TABLE "audit_answers" ADD CONSTRAINT "audit_answers_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
