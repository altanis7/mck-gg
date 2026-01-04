"use client";

import { useState } from "react";
import Link from "next/link";
import { useMatchSeries } from "@/features/matches/hooks/useMatchSeries";
import { Button } from "@/shared/components/ui/Button";
import { Loading } from "@/shared/components/ui/Loading";
import { ErrorMessage } from "@/shared/components/ui/ErrorMessage";
import { CompleteSeriesModal } from "@/features/matches/components/CompleteSeriesModal";

export default function MatchesPage() {
  const { data: series, isLoading, error, refetch } = useMatchSeries();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error.message} />
      </div>
    );
  }

  if (!series) {
    return null;
  }

  const handleCompleteSeries = (seriesId: string) => {
    const selectedSeries = series.find((s) => s.id === seriesId);
    if (!selectedSeries) return;

    // 검증 (team_a_wins / team_b_wins 기반)
    const teamAWins = selectedSeries.team_a_wins ?? 0;
    const teamBWins = selectedSeries.team_b_wins ?? 0;
    if (teamAWins === teamBWins) {
      alert("무승부는 불가능합니다 (승리 팀을 판단할 수 없음)");
      return;
    }

    setSelectedSeriesId(seriesId);
    setShowCompleteModal(true);
  };

  const confirmCompleteSeries = async () => {
    if (!selectedSeriesId) return;

    const selectedSeries = series.find((s) => s.id === selectedSeriesId);
    if (!selectedSeries) return;

    setIsCompleting(true);
    try {
      // team_a/team_b 기반으로 승자 결정
      const teamAWins = selectedSeries.team_a_wins ?? 0;
      const teamBWins = selectedSeries.team_b_wins ?? 0;
      const winnerTeam = teamAWins > teamBWins ? "team_a" : "team_b";

      const response = await fetch(`/api/match-series/${selectedSeriesId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_status: "completed",
          winner_team: winnerTeam,
        }),
      });

      if (!response.ok) throw new Error("시리즈 완료 실패");

      setShowCompleteModal(false);
      setSelectedSeriesId(null);
      refetch(); // 목록 새로고침
    } catch (error) {
      console.error("시리즈 완료 실패:", error);
      alert("시리즈 완료에 실패했습니다.");
    } finally {
      setIsCompleting(false);
    }
  };

  const selectedSeries = selectedSeriesId
    ? series.find((s) => s.id === selectedSeriesId)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">경기 관리</h1>
        <Link href="/admin/matches/new">
          <Button>경기 등록</Button>
        </Link>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
          <p className="text-gray-300 mb-4">등록된 시리즈가 없습니다</p>
          <Link href="/admin/matches/new">
            <Button>첫 시리즈 등록하기</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {series.map((s) => {
            const seriesTypeLabel =
              s.series_type === "bo1"
                ? "단판"
                : s.series_type === "bo3"
                ? "3판 2선승"
                : "5판 3선승";

            const statusLabel =
              s.series_status === "scheduled"
                ? "예정"
                : s.series_status === "ongoing"
                ? "진행중"
                : "완료";

            return (
              <div
                key={s.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <Link
                    href={`/admin/matches/${s.id}`}
                    className="flex-1 hover:opacity-80 transition-opacity"
                  >
                    <div>
                      <p className="text-sm text-gray-400">
                        {new Date(s.series_date).toLocaleString("ko-KR")}
                      </p>
                      <p className="text-lg font-semibold text-white mt-1">
                        {seriesTypeLabel}
                      </p>
                      {s.series_status === "completed" && (
                        <p className="text-sm text-gray-300 mt-1">
                          결과: {s.team_a_wins ?? 0} - {s.team_b_wins ?? 0}
                        </p>
                      )}
                      {s.series_status === "ongoing" && (
                        <p className="text-sm text-gray-300 mt-1">
                          현재: {s.team_a_wins ?? 0} - {s.team_b_wins ?? 0}
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        s.series_status === "completed"
                          ? "bg-green-100 text-green-700"
                          : s.series_status === "ongoing"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabel}
                    </div>
                    {(s.series_status === "ongoing" ||
                      s.series_status === "scheduled") && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCompleteSeries(s.id);
                        }}
                      >
                        완료
                      </Button>
                    )}
                  </div>
                </div>
                {s.notes && (
                  <p className="text-gray-400 mt-2 text-sm">{s.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 시리즈 완료 확인 모달 */}
      {showCompleteModal && selectedSeries && (
        <CompleteSeriesModal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedSeriesId(null);
          }}
          onConfirm={confirmCompleteSeries}
          teamAWins={selectedSeries.team_a_wins ?? 0}
          teamBWins={selectedSeries.team_b_wins ?? 0}
          isCompleting={isCompleting}
        />
      )}
    </div>
  );
}
