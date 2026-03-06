/*
  Warnings:

  - A unique constraint covering the columns `[game_id,genre_id]` on the table `game_genres` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[game_id,platform_id]` on the table `game_platforms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[game_id,theme_id]` on the table `game_themes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "game_genres_game_id_genre_id_key" ON "game_genres"("game_id", "genre_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_platforms_game_id_platform_id_key" ON "game_platforms"("game_id", "platform_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_themes_game_id_theme_id_key" ON "game_themes"("game_id", "theme_id");
