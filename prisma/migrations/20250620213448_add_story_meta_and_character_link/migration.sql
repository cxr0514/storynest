-- CreateEnum
CREATE TYPE "StoryLanguage" AS ENUM ('English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Swedish', 'Japanese', 'Chinese');

-- CreateEnum
CREATE TYPE "StoryCategory" AS ENUM ('BedtimeStory', 'Fable', 'Fairytale', 'Adventure', 'Educational', 'Mystery', 'ScienceFiction', 'RealisticFiction');

-- CreateEnum
CREATE TYPE "StoryWritingStyle" AS ENUM ('Imaginative', 'Funny', 'Heartwarming', 'ActionPacked', 'Nostalgic', 'Empowering', 'Spooky', 'Educational');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "category" "StoryCategory" NOT NULL DEFAULT 'BedtimeStory',
ADD COLUMN     "language" "StoryLanguage" NOT NULL DEFAULT 'English',
ADD COLUMN     "readerAge" TEXT NOT NULL DEFAULT '5 – 7 years',
ADD COLUMN     "writingStyle" "StoryWritingStyle" NOT NULL DEFAULT 'Imaginative';
