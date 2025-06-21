-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "styleName" TEXT NOT NULL DEFAULT 'storybook_soft';

-- AlterTable
ALTER TABLE "ChildProfile" ADD COLUMN     "avatarUrl" TEXT;
