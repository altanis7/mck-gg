"use client";

import { useMatchSeries } from "@/features/matches/hooks/useMatchSeries";
import { Loading } from "@/shared/components/ui/Loading";
import { ErrorMessage } from "@/shared/components/ui/ErrorMessage";
import Link from "next/link";

export default function MatchesPage() {
  const { data: series, isLoading, error } = useMatchSeries();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={error?.message || "경기 목록을 불러올 수 없습니다"}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">경기 기록</h1>

      {series.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">아직 등록된 경기가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {series.map((item) => {
            const seriesTypeLabel =
              item.series_type === "bo1"
                ? "단판"
                : item.series_type === "bo3"
                ? "BO3"
                : "BO5";

            const statusLabel =
              item.series_status === "scheduled"
                ? "예정"
                : item.series_status === "ongoing"
                ? "진행중"
                : "완료";

            return (
              <Link
                key={item.id}
                href={`/matches/${item.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {new Date(item.series_date).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                        {seriesTypeLabel}
                      </span>
                      <span
                        className={`px-2 py-1 text-sm font-medium rounded ${
                          item.series_status === "completed"
                            ? "bg-green-100 text-green-700"
                            : item.series_status === "ongoing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {item.series_status === "completed" && item.winner_team && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">결과:</span>
                        <span
                          className={`text-sm font-bold ${
                            item.winner_team === "blue"
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.blue_wins} - {item.red_wins}{" "}
                          {item.winner_team === "blue" ? "블루팀" : "레드팀"}{" "}
                          승리
                        </span>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-2">{item.notes}</p>
                    )}
                  </div>

                  <div className="text-sm text-gray-400">
                    {new Date(item.series_date).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
