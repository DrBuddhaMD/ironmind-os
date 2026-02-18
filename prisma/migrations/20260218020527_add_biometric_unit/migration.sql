-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Biometric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'lbs',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Biometric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Biometric" ("createdAt", "id", "type", "userId", "value") SELECT "createdAt", "id", "type", "userId", "value" FROM "Biometric";
DROP TABLE "Biometric";
ALTER TABLE "new_Biometric" RENAME TO "Biometric";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
