import { Crown, Medal, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/lib/game-store";
import { cn, formatNumber } from "@/lib/utils";

type Player = {
  rank: number;
  name: string;
  guild: string;
  cards: number;
  xp: number;
  wins: number;
  trend: "up" | "down" | "flat";
};

const PLAYERS: Player[] = [
  { rank: 1, name: "Ambre_W", guild: "Les Archivistes", cards: 46, xp: 18420, wins: 212, trend: "up" },
  { rank: 2, name: "K. Ndiaye", guild: "Bibliothèque Noire", cards: 45, xp: 17310, wins: 198, trend: "flat" },
  { rank: 3, name: "Léa.Savant", guild: "Les Archivistes", cards: 44, xp: 16980, wins: 187, trend: "up" },
  { rank: 4, name: "marcel.curieux", guild: "Cartographes", cards: 43, xp: 15540, wins: 175, trend: "down" },
  { rank: 5, name: "Yuki_K", guild: "Atelier des estampes", cards: 42, xp: 14880, wins: 164, trend: "up" },
  { rank: 6, name: "T. Ravel", guild: "Cartographes", cards: 40, xp: 13920, wins: 158, trend: "flat" },
  { rank: 7, name: "Salim", guild: "Les Archivistes", cards: 12, xp: 1240, wins: 23, trend: "up", },
  { rank: 8, name: "nina.explore", guild: "Bibliothèque Noire", cards: 11, xp: 1180, wins: 21, trend: "down" },
  { rank: 9, name: "paul.h", guild: "Cartographes", cards: 10, xp: 980, wins: 17, trend: "flat" },
  { rank: 10, name: "Zoé_M", guild: "Atelier des estampes", cards: 9, xp: 870, wins: 14, trend: "up" },
];

const GUILDS = [
  { name: "Les Archivistes", members: 128, focus: "Histoire & Sciences" },
  { name: "Bibliothèque Noire", members: 96, focus: "Récits & mythes" },
  { name: "Cartographes", members: 74, focus: "Lieux du monde" },
  { name: "Atelier des estampes", members: 61, focus: "Arts & techniques" },
];

function TrendBadge({ trend }: { trend: Player["trend"] }) {
  if (trend === "flat") return <span className="text-muted-foreground text-[10px]">—</span>;
  return (
    <span className={cn("text-[10px]", trend === "up" ? "text-emerald-400" : "text-red-400")}>
      {trend === "up" ? "▲" : "▼"}
    </span>
  );
}

export function LeaderboardPage() {
  const { profile, collection } = useGame();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communauté"
        title="Classement de la saison"
        description="Le classement combine les points d'expérience, le nombre de fiches distinctes et les duels remportés. Il se réinitialise à chaque nouvelle saison."
        actions={
          <Badge variant="secondary" className="h-8 gap-1.5 px-3">
            <Trophy className="size-3.5 text-[var(--gold)]" /> Saison 1
          </Badge>
        }
      />

      <Tabs defaultValue="joueurs">
        <TabsList>
          <TabsTrigger value="joueurs">
            <Users className="size-3.5" /> Joueurs
          </TabsTrigger>
          <TabsTrigger value="guildes">
            <Crown className="size-3.5" /> Guildes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="joueurs">
          <Card className="overflow-hidden py-0">
            <div className="text-muted-foreground grid grid-cols-[40px_1fr_80px_80px_70px] items-center gap-2 border-b px-4 py-3 text-[10px] font-semibold tracking-wider uppercase sm:grid-cols-[48px_1fr_1fr_90px_90px_80px]">
              <span>#</span>
              <span>Collectionneur</span>
              <span className="hidden sm:block">Guilde</span>
              <span className="text-right">Fiches</span>
              <span className="text-right">XP</span>
              <span className="text-right">Duels</span>
            </div>
            <div className="divide-y">
              {PLAYERS.map((player) => {
                const isMe = player.name === profile.displayName;
                return (
                  <div
                    key={player.rank}
                    className={cn(
                      "grid grid-cols-[40px_1fr_80px_80px_70px] items-center gap-2 px-4 py-3 text-sm sm:grid-cols-[48px_1fr_1fr_90px_90px_80px]",
                      isMe && "bg-primary/10",
                    )}
                  >
                    <span className="flex items-center gap-1 font-mono text-xs font-semibold">
                      {player.rank <= 3 ? (
                        <Medal
                          className={cn(
                            "size-3.5",
                            player.rank === 1
                              ? "text-[var(--gold)]"
                              : player.rank === 2
                                ? "text-slate-300"
                                : "text-amber-700",
                          )}
                        />
                      ) : null}
                      {player.rank}
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-7 shrink-0">
                        <AvatarFallback className="bg-muted text-[10px] font-semibold">
                          {player.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn("truncate", isMe && "font-semibold")}>
                        {player.name}
                        {isMe && (
                          <Badge variant="outline" className="ml-1.5 px-1 py-0 text-[9px]">
                            vous
                          </Badge>
                        )}
                      </span>
                      <TrendBadge trend={player.trend} />
                    </div>
                    <span className="text-muted-foreground hidden truncate text-xs sm:block">
                      {player.guild}
                    </span>
                    <span className="text-right text-xs tabular-nums">
                      {isMe ? collection.length : player.cards}
                    </span>
                    <span className="text-right text-xs tabular-nums">
                      {formatNumber(isMe ? profile.xp : player.xp)}
                    </span>
                    <span className="text-right text-xs tabular-nums">
                      {isMe ? profile.duelWins : player.wins}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="guildes">
          <div className="grid gap-4 sm:grid-cols-2">
            {GUILDS.map((guild, index) => (
              <Card key={guild.name} className="bg-card/60">
                <CardContent className="flex items-center gap-3">
                  <span className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-lg font-display font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-display font-semibold">{guild.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {guild.members} membres · {guild.focus}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {formatNumber(guild.members * 1320)} pts
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
