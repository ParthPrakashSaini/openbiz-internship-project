-- CreateTable
CREATE TABLE "public"."Registration" (
    "id" TEXT NOT NULL,
    "aadhaarNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Registration_aadhaarNumber_key" ON "public"."Registration"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_panNumber_key" ON "public"."Registration"("panNumber");
