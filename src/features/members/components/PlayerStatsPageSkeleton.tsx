export function PlayerStatsPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      {/* 왼쪽 컬럼 */}
      <div className="space-y-6 lg:col-span-1">
        {/* 프로필 카드 */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg h-96" />
        {/* 그래프 */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg h-96" />
        {/* 챔피언 목록 */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg h-64" />
        {/* 포지션 통계 */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg h-48" />
      </div>

      {/* 오른쪽 컬럼 */}
      <div className="lg:col-span-2">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-slate-800 border border-slate-700 rounded-lg h-32"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
