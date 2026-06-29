-- CreateTable
CREATE TABLE "program_faqs" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_faqs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "program_faqs" ADD CONSTRAINT "program_faqs_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
