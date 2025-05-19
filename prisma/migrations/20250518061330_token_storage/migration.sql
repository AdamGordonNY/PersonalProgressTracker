-- CreateTable
CREATE TABLE "UserGoogleToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoogleToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMicrosoftToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMicrosoftToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoogleToken_userId_key" ON "UserGoogleToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMicrosoftToken_userId_key" ON "UserMicrosoftToken"("userId");

-- AddForeignKey
ALTER TABLE "UserGoogleToken" ADD CONSTRAINT "UserGoogleToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMicrosoftToken" ADD CONSTRAINT "UserMicrosoftToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
