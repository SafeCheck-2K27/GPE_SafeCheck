-- CreateTable
CREATE TABLE "user_tutorial_progress" (
    "userId" TEXT NOT NULL,
    "tutorialId" INTEGER NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "completedSteps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tutorial_progress_pkey" PRIMARY KEY ("userId","tutorialId")
);

-- AddForeignKey
ALTER TABLE "user_tutorial_progress" ADD CONSTRAINT "user_tutorial_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
