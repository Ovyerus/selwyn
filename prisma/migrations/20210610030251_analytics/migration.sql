-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "referrer" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redirectId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Visitor" ADD FOREIGN KEY ("redirectId") REFERENCES "Redirect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
