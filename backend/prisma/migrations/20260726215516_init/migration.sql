-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ACTIVE', 'FINISHED', 'CANCELED');

-- CreateTable
CREATE TABLE "user_result" (
    "id" TEXT NOT NULL,
    "wpm" DOUBLE PRECISION NOT NULL,
    "correctChars" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "mistakes" INTEGER NOT NULL,
    "cpm" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "time" INTEGER NOT NULL DEFAULT 60,
    "userId" TEXT NOT NULL,
    "resultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_resultId_key" ON "match"("resultId");

-- AddForeignKey
ALTER TABLE "user_result" ADD CONSTRAINT "user_result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "user_result"("id") ON DELETE SET NULL ON UPDATE CASCADE;
