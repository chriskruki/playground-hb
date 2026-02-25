"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  clearGameState,
  getGameState,
  getPlayerImage,
  saveGameState,
  savePlayerImage,
  type GameState,
  type Player,
} from "@/lib/storage";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Plus, RotateCcw, Trash2, Trophy, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Phase = "setup" | "scoring" | "leaderboard";

/**
 * Logo component with fallback handling
 * Loads Playground HB logo from their CDN, falls back to styled text
 */
function LogoFallback() {
  const [logoError, setLogoError] = useState(false);
  // Logo URL extracted from playgroundhb.com header
  const logoUrl = "https://playgroundhb.com/cdn/shop/files/playground_logo_only_black_copy.png?v=1754119599&height=60";

  return (
    <>
      {!logoError && (
        <img src={logoUrl} alt="Playground Mini Golf" className="h-12 w-auto" onError={() => setLogoError(true)} />
      )}
      {logoError && (
        <div className="flex items-center gap-2">
          <span className="text-3xl">⛳</span>
          <span className="text-2xl font-bold text-primary">Playground Mini Golf</span>
        </div>
      )}
    </>
  );
}

export default function MiniGolfScoreApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<Player[]>([{ id: "1", name: "", scores: [] }]);
  const [currentHole, setCurrentHole] = useState(1);
  const [playerImages, setPlayerImages] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = getGameState();
    if (savedState) {
      setPlayers(savedState.players);
      setCurrentHole(savedState.currentHole);
      setPhase(savedState.phase);
      // Load player images
      const images: Record<string, string> = {};
      savedState.players.forEach((player) => {
        const image = getPlayerImage(player.id);
        if (image) {
          images[player.id] = image;
        }
      });
      setPlayerImages(images);
    }
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    if (phase !== "setup") {
      const gameState: GameState = {
        players,
        currentHole,
        phase,
        playerImages,
      };
      saveGameState(gameState);
    }
  }, [players, currentHole, phase, playerImages]);

  // Initialize scores array for all players when entering scoring phase
  useEffect(() => {
    if (phase === "scoring") {
      setPlayers((prev) =>
        prev.map((player) => ({
          ...player,
          scores: player.scores.length === 0 ? Array(9).fill(0) : player.scores,
        })),
      );
    }
  }, [phase]);

  const addPlayer = () => {
    const newId = String(Date.now());
    setPlayers([...players, { id: newId, name: "", scores: [] }]);
  };

  const removePlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(players.filter((p) => p.id !== id));
      // Remove image if exists
      if (playerImages[id]) {
        const newImages = { ...playerImages };
        delete newImages[id];
        setPlayerImages(newImages);
        localStorage.removeItem(`player-image-${id}`);
      }
    }
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleImageCapture = (playerId: string) => {
    const input = fileInputRefs.current[playerId];
    if (input) {
      input.click();
    }
  };

  const handleImageChange = (playerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPlayerImages({ ...playerImages, [playerId]: base64String });
      savePlayerImage(playerId, base64String);
    };
    reader.readAsDataURL(file);
  };

  const confirmPlayers = () => {
    const validPlayers = players.filter((p) => p.name.trim() !== "");
    if (validPlayers.length === 0) {
      alert("Please add at least one player with a name.");
      return;
    }
    setPlayers(validPlayers);
    setPhase("scoring");
    setCurrentHole(1);
  };

  const updateScore = (playerId: string, holeIndex: number, score: number) => {
    setPlayers(
      players.map((player) => {
        if (player.id === playerId) {
          const newScores = [...player.scores];
          newScores[holeIndex] = score;
          return { ...player, scores: newScores };
        }
        return player;
      }),
    );
  };

  const goToLeaderboard = () => {
    setPhase("leaderboard");
  };

  const editPlayers = () => {
    // Go back to setup phase but keep existing players
    setPhase("setup");
  };

  const endGameEarly = () => {
    // Go to leaderboard even if not all holes completed
    setPhase("leaderboard");
  };

  const resetGame = () => {
    clearGameState();
    setPlayers([{ id: "1", name: "", scores: [] }]);
    setCurrentHole(1);
    setPhase("setup");
    setPlayerImages({});
  };

  const getTotalScore = (player: Player): number => {
    return player.scores.reduce((sum, score) => sum + (score || 0), 0);
  };

  const sortedPlayers = [...players].sort((a, b) => getTotalScore(a) - getTotalScore(b));

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header with Playground HB Logo and Navigation */}
      <header className="sticky top-0 z-50 border-b border-border shadow-sm backdrop-blur-sm bg-background/95">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          {/* Logo */}
          <div className="flex items-center justify-center mb-3">
            <LogoFallback />
          </div>

          {/* Navigation Bar */}
          {(phase === "scoring" || phase === "leaderboard") && (
            <nav className="flex items-center justify-center gap-2">
              {phase === "scoring" && (
                <>
                  <Button variant="outline" size="sm" onClick={editPlayers} className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Players</span>
                    <span className="sm:hidden">Players</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={endGameEarly} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">End Game</span>
                    <span className="sm:hidden">End</span>
                  </Button>
                </>
              )}
              {phase === "leaderboard" && (
                <>
                  <Button variant="outline" size="sm" onClick={editPlayers} className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Players</span>
                    <span className="sm:hidden">Players</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetGame} className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">New Game</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h1
                className="text-4xl font-bold text-center mb-8 text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Who&apos;s playing?
              </motion.h1>

              {/* Player cards */}
              <div className="space-y-4 mb-6">
                <AnimatePresence>
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            {/* Player number badge */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                              {index + 1}
                            </div>

                            {/* Player image */}
                            <div className="flex-shrink-0">
                              {playerImages[player.id] ? (
                                <motion.img
                                  src={playerImages[player.id]}
                                  alt={player.name || `Player ${index + 1}`}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                  <Camera className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <input
                                ref={(el) => {
                                  fileInputRefs.current[player.id] = el;
                                }}
                                type="file"
                                accept="image/*"
                                capture="user"
                                className="hidden"
                                onChange={(e) => handleImageChange(player.id, e)}
                              />
                            </div>

                            {/* Name input */}
                            <Input
                              placeholder={`Player ${index + 1} name`}
                              value={player.name}
                              onChange={(e) => updatePlayerName(player.id, e.target.value)}
                              className="flex-1"
                            />

                            {/* Image capture button */}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleImageCapture(player.id)}
                              aria-label="Capture image"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>

                            {/* Delete button */}
                            {index > 0 && (
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => removePlayer(player.id)}
                                aria-label="Remove player"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add player button */}
              <div className="mb-6">
                <Button onClick={addPlayer} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </div>

              {/* Confirm button at bottom (sticky on mobile, centered on desktop) */}
              <div className="fixed bottom-0 left-0 right-0 border-t p-4 sm:relative sm:border-0 sm:p-0 sm:pb-6 backdrop-blur-sm bg-background/95">
                <div className="container mx-auto max-w-4xl sm:flex sm:justify-center">
                  <Button onClick={confirmPlayers} size="lg" className="w-full sm:w-auto">
                    Confirm Players
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "scoring" && (
            <motion.div
              key="scoring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-center mb-6 text-primary">Hole {currentHole}</h1>

              {/* Hole selection toggle */}
              <div className="mb-6 flex justify-center">
                <ToggleGroup
                  type="single"
                  value={String(currentHole)}
                  onValueChange={(value: string) => value && setCurrentHole(Number(value))}
                  variant="outline"
                  spacing={8}
                >
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((hole) => (
                    <ToggleGroupItem
                      key={hole}
                      value={String(hole)}
                      aria-label={`Hole ${hole}`}
                      className="min-w-[44px]"
                    >
                      {hole}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Player score cards */}
              <div className="space-y-4 mb-6">
                {players.map((player, index) => {
                  const score = player.scores[currentHole - 1] || 0;
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            {/* Player avatar */}
                            {playerImages[player.id] ? (
                              <img
                                src={playerImages[player.id]}
                                alt={player.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                <span className="text-sm font-bold text-muted-foreground">
                                  {player.name.charAt(0).toUpperCase() || "?"}
                                </span>
                              </div>
                            )}

                            {/* Player name */}
                            <div className="flex-1">
                              <p className="font-semibold">{player.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Total: {getTotalScore(player)} | Hole {currentHole}
                              </p>
                            </div>

                            {/* Score input */}
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={score || ""}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                if (value >= 1 && value <= 10) {
                                  updateScore(player.id, currentHole - 1, value);
                                }
                              }}
                              placeholder="Score"
                              className="w-24 text-center text-lg font-bold"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress indicator */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Completed: {players[0]?.scores.filter((s) => s > 0).length || 0} / 9 holes
                </p>
                <div className="flex gap-1 justify-center">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((hole) => {
                    const isCompleted = players.some((p) => p.scores[hole - 1] > 0);
                    return (
                      <div
                        key={hole}
                        className={`w-8 h-2 rounded ${isCompleted ? "bg-primary" : "bg-muted"} ${
                          hole === currentHole ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Finish game button */}
              {players[0]?.scores.filter((s) => s > 0).length === 9 && (
                <div className="flex justify-center">
                  <Button onClick={goToLeaderboard} size="lg" className="w-full sm:w-auto">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Leaderboard
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {phase === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-4xl font-bold text-center mb-8 text-primary">Final Scores</h1>

              <div className="space-y-4 mb-6">
                <AnimatePresence>
                  {sortedPlayers.map((player, index) => {
                    const totalScore = getTotalScore(player);
                    const isWinner = index === 0;
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={isWinner ? "border-primary border-2" : ""}>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                              {/* Rank */}
                              <div
                                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                  isWinner ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {index + 1}
                              </div>

                              {/* Player avatar */}
                              {playerImages[player.id] ? (
                                <img
                                  src={playerImages[player.id]}
                                  alt={player.name}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                  <span className="text-xl font-bold text-muted-foreground">
                                    {player.name.charAt(0).toUpperCase() || "?"}
                                  </span>
                                </div>
                              )}

                              {/* Player info */}
                              <div className="flex-1">
                                <p className="font-bold text-lg">{player.name}</p>
                                <p className="text-2xl font-bold text-primary">{totalScore}</p>
                                <p className="text-sm text-muted-foreground">
                                  {player.scores.filter((s) => s > 0).length} holes completed
                                </p>
                              </div>

                              {/* Trophy icon for winner */}
                              {isWinner && <Trophy className="h-8 w-8 text-primary" />}
                            </div>

                            {/* Hole scores detail */}
                            <details className="mt-4">
                              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                View hole scores
                              </summary>
                              <div className="mt-2 grid grid-cols-9 gap-2">
                                {player.scores.map((score, holeIndex) => (
                                  <div key={holeIndex} className="text-center p-2 bg-muted rounded">
                                    <div className="text-xs text-muted-foreground">H{holeIndex + 1}</div>
                                    <div className="font-bold">{score || "-"}</div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Reset button */}
              <div className="flex justify-center">
                <Button onClick={resetGame} variant="outline" size="lg" className="w-full sm:w-auto">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start New Game
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
