-- Keep the column nullable so existing accounts can still sign in with email.
-- New registrations are required by the API to provide a NIP.
ALTER TABLE "User" ADD COLUMN "nip" TEXT;

CREATE UNIQUE INDEX "User_nip_key" ON "User"("nip");
CREATE INDEX "User_nip_idx" ON "User"("nip");
