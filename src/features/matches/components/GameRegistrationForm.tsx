"use client";

import { useState } from "react";
import { useMembers } from "@/features/members/hooks/useMembers";
import { createGame, addGameResults } from "../api/gamesApi";
import { addBanPicks } from "../api/banPicksApi";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { ErrorMessage } from "@/shared/components/ui/ErrorMessage";
import { Loading } from "@/shared/components/ui/Loading";
import { CreateGameResultDto } from "../api/types";

const POSITIONS = ["top", "jungle", "mid", "adc", "support"] as const;
type Position = (typeof POSITIONS)[number];

interface PlayerData {
  member_id: string;
  position: Position;
  champion_name: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  champion_damage: number;
}

interface GameRegistrationFormProps {
  seriesId: string;
  gameNumber: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function GameRegistrationForm({
  seriesId,
  gameNumber,
  onSuccess,
  onCancel,
}: GameRegistrationFormProps) {
  const { data: members, isLoading: membersLoading } = useMembers();

  // 게임 기본 정보
  const [duration, setDuration] = useState("");
  const [winningTeam, setWinningTeam] = useState<"blue" | "red">("blue");

  // 블루팀 선수 (5명)
  const [bluePlayers, setBluePlayers] = useState<PlayerData[]>(
    POSITIONS.map((pos) => ({
      member_id: "",
      position: pos,
      champion_name: "",
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      champion_damage: 0,
    }))
  );

  // 레드팀 선수 (5명)
  const [redPlayers, setRedPlayers] = useState<PlayerData[]>(
    POSITIONS.map((pos) => ({
      member_id: "",
      position: pos,
      champion_name: "",
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      champion_damage: 0,
    }))
  );

  // 밴 정보
  const [blueBans, setBlueBans] = useState<string[]>(Array(5).fill(""));
  const [redBans, setRedBans] = useState<string[]>(Array(5).fill(""));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseDuration = (input: string): number => {
    // MM:SS 형식 파싱
    if (input.includes(':')) {
      const [minutes, seconds] = input.split(':').map(Number);
      return minutes * 60 + seconds;
    }
    // 숫자만 입력시 분으로 처리 (역호환)
    return parseInt(input) * 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!duration) {
      setError("경기 시간을 입력해주세요");
      return;
    }

    // 블루팀 선수 검증
    for (const player of bluePlayers) {
      if (!player.member_id || !player.champion_name) {
        setError("블루팀의 모든 선수와 챔피언을 선택해주세요");
        return;
      }
    }

    // 레드팀 선수 검증
    for (const player of redPlayers) {
      if (!player.member_id || !player.champion_name) {
        setError("레드팀의 모든 선수와 챔피언을 선택해주세요");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. 게임 생성
      const gameResponse = await createGame({
        match_series_id: seriesId,
        game_number: gameNumber,
        duration: parseDuration(duration), // MM:SS 또는 분 → 초
        winning_team: winningTeam,
      });

      if (!gameResponse.success || !gameResponse.data) {
        throw new Error(gameResponse.error || "게임 생성 실패");
      }

      const gameId = gameResponse.data.id;

      // 2. 게임 결과 등록 (블루팀 + 레드팀 10명)
      const allPlayers: CreateGameResultDto[] = [
        ...bluePlayers.map((p) => ({
          ...p,
          team: "blue" as const,
          damage_taken: 0,
          gold_earned: 0,
          vision_score: 0,
          wards_placed: 0,
          wards_destroyed: 0,
        })),
        ...redPlayers.map((p) => ({
          ...p,
          team: "red" as const,
          damage_taken: 0,
          gold_earned: 0,
          vision_score: 0,
          wards_placed: 0,
          wards_destroyed: 0,
        })),
      ];

      const resultsResponse = await addGameResults(gameId, allPlayers);

      if (!resultsResponse.success) {
        throw new Error(resultsResponse.error || "게임 결과 저장 실패");
      }

      // 3. 밴픽 데이터 등록
      const banData = [
        ...blueBans
          .filter((b) => b)
          .map((champion, idx) => ({
            team: "blue" as const,
            phase: "ban" as const,
            order_number: idx + 1,
            champion_name: champion,
          })),
        ...redBans
          .filter((b) => b)
          .map((champion, idx) => ({
            team: "red" as const,
            phase: "ban" as const,
            order_number: idx + 6,
            champion_name: champion,
          })),
      ];

      const pickData = [
        ...bluePlayers.map((p, idx) => ({
          team: "blue" as const,
          phase: "pick" as const,
          order_number: idx + 11,
          champion_name: p.champion_name,
          position: p.position,
          selected_by_member_id: p.member_id,
        })),
        ...redPlayers.map((p, idx) => ({
          team: "red" as const,
          phase: "pick" as const,
          order_number: idx + 16,
          champion_name: p.champion_name,
          position: p.position,
          selected_by_member_id: p.member_id,
        })),
      ];

      const banPicksResponse = await addBanPicks(gameId, [
        ...banData,
        ...pickData,
      ]);

      if (!banPicksResponse.success) {
        throw new Error(banPicksResponse.error || "밴픽 저장 실패");
      }

      // 성공
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "게임 등록 실패");
      setIsSubmitting(false);
    }
  };

  if (membersLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">{gameNumber}게임 등록</h3>

        {error && <ErrorMessage message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 게임 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                경기 시간 (MM:SS)
              </label>
              <Input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="37:35"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                승리 팀
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="blue"
                    checked={winningTeam === "blue"}
                    onChange={(e) =>
                      setWinningTeam(e.target.value as "blue" | "red")
                    }
                    className="mr-2"
                  />
                  <span className="text-white">블루팀</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="red"
                    checked={winningTeam === "red"}
                    onChange={(e) =>
                      setWinningTeam(e.target.value as "blue" | "red")
                    }
                    className="mr-2"
                  />
                  <span className="text-white">레드팀</span>
                </label>
              </div>
            </div>
          </div>

          {/* 밴 정보 */}
          <div className="bg-slate-900 p-4 rounded">
            <h4 className="text-lg font-bold text-white mb-4">밴 정보</h4>
            <div className="grid grid-cols-2 gap-6">
              {/* 블루팀 밴 */}
              <div>
                <h5 className="text-sm font-semibold text-blue-400 mb-2">
                  블루팀
                </h5>
                <div className="space-y-2">
                  {blueBans.map((ban, idx) => (
                    <Input
                      key={`blue-ban-${idx}`}
                      type="text"
                      value={ban}
                      onChange={(e) => {
                        const newBans = [...blueBans];
                        newBans[idx] = e.target.value;
                        setBlueBans(newBans);
                      }}
                      placeholder={`밴 ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* 레드팀 밴 */}
              <div>
                <h5 className="text-sm font-semibold text-red-400 mb-2">
                  레드팀
                </h5>
                <div className="space-y-2">
                  {redBans.map((ban, idx) => (
                    <Input
                      key={`red-ban-${idx}`}
                      type="text"
                      value={ban}
                      onChange={(e) => {
                        const newBans = [...redBans];
                        newBans[idx] = e.target.value;
                        setRedBans(newBans);
                      }}
                      placeholder={`밴 ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 블루팀 */}
          <div className="bg-blue-950 p-4 rounded">
            <h4 className="text-lg font-bold text-blue-400 mb-4">블루팀</h4>

            {/* 헤더 행 */}
            <div className="grid grid-cols-10 gap-2 items-center text-xs font-semibold text-gray-300 mb-2">
              <div className="col-span-1">포지션</div>
              <div className="col-span-2">멤버</div>
              <div className="col-span-2">챔피언</div>
              <div className="col-span-1 text-center">K</div>
              <div className="col-span-1 text-center">D</div>
              <div className="col-span-1 text-center">A</div>
              <div className="col-span-1 text-center">CS</div>
              <div className="col-span-1 text-center">딜량</div>
            </div>

            <div className="space-y-3">
              {POSITIONS.map((position, idx) => (
                <PlayerInput
                  key={`blue-${position}`}
                  position={position}
                  player={bluePlayers[idx]}
                  members={members || []}
                  onChange={(updatedPlayer) => {
                    const newPlayers = [...bluePlayers];
                    newPlayers[idx] = updatedPlayer;
                    setBluePlayers(newPlayers);
                  }}
                />
              ))}
            </div>
          </div>

          {/* 레드팀 */}
          <div className="bg-red-950 p-4 rounded">
            <h4 className="text-lg font-bold text-red-400 mb-4">레드팀</h4>

            {/* 헤더 행 */}
            <div className="grid grid-cols-10 gap-2 items-center text-xs font-semibold text-gray-300 mb-2">
              <div className="col-span-1">포지션</div>
              <div className="col-span-2">멤버</div>
              <div className="col-span-2">챔피언</div>
              <div className="col-span-1 text-center">K</div>
              <div className="col-span-1 text-center">D</div>
              <div className="col-span-1 text-center">A</div>
              <div className="col-span-1 text-center">CS</div>
              <div className="col-span-1 text-center">딜량</div>
            </div>

            <div className="space-y-3">
              {POSITIONS.map((position, idx) => (
                <PlayerInput
                  key={`red-${position}`}
                  position={position}
                  player={redPlayers[idx]}
                  members={members || []}
                  onChange={(updatedPlayer) => {
                    const newPlayers = [...redPlayers];
                    newPlayers[idx] = updatedPlayer;
                    setRedPlayers(newPlayers);
                  }}
                />
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "게임 저장"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 플레이어 입력 컴포넌트
interface PlayerInputProps {
  position: Position;
  player: PlayerData;
  members: Array<{ id: string; summoner_name: string }>;
  onChange: (player: PlayerData) => void;
}

function PlayerInput({
  position,
  player,
  members,
  onChange,
}: PlayerInputProps) {
  const positionLabels: Record<Position, string> = {
    top: "탑",
    jungle: "정글",
    mid: "미드",
    adc: "원딜",
    support: "서포터",
  };

  return (
    <div className="grid grid-cols-10 gap-2 items-center text-sm">
      <div className="col-span-1 font-semibold text-white">{positionLabels[position]}</div>

      <div className="col-span-2">
        <Select
          value={player.member_id}
          onChange={(e) => onChange({ ...player, member_id: e.target.value })}
          required
        >
          <option value="">멤버 선택</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.summoner_name}
            </option>
          ))}
        </Select>
      </div>

      <div className="col-span-2">
        <Input
          type="text"
          value={player.champion_name}
          onChange={(e) =>
            onChange({ ...player, champion_name: e.target.value })
          }
          placeholder="챔피언"
          required
        />
      </div>

      <div className="col-span-1">
        <Input
          type="number"
          min="0"
          value={player.kills}
          onChange={(e) =>
            onChange({ ...player, kills: parseInt(e.target.value) || 0 })
          }
          placeholder="K"
          required
        />
      </div>

      <div className="col-span-1">
        <Input
          type="number"
          min="0"
          value={player.deaths}
          onChange={(e) =>
            onChange({ ...player, deaths: parseInt(e.target.value) || 0 })
          }
          placeholder="D"
          required
        />
      </div>

      <div className="col-span-1">
        <Input
          type="number"
          min="0"
          value={player.assists}
          onChange={(e) =>
            onChange({ ...player, assists: parseInt(e.target.value) || 0 })
          }
          placeholder="A"
          required
        />
      </div>

      <div className="col-span-1">
        <Input
          type="number"
          min="0"
          value={player.cs}
          onChange={(e) =>
            onChange({ ...player, cs: parseInt(e.target.value) || 0 })
          }
          placeholder="CS"
          required
        />
      </div>

      <div className="col-span-1">
        <Input
          type="number"
          min="0"
          value={player.champion_damage}
          onChange={(e) =>
            onChange({
              ...player,
              champion_damage: parseInt(e.target.value) || 0,
            })
          }
          placeholder="딜량"
          required
        />
      </div>
    </div>
  );
}
