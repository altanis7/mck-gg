import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          MCK.GG에 오신 것을 환영합니다
        </h1>
        <p className="text-lg text-gray-600">
          리그오브레전드 내전 기록 및 통계 플랫폼
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>경기 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              내전 경기 기록을 확인하세요
            </p>
            <Link href="/matches">
              <Button variant="outline" className="w-full">
                경기 보기
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>통계</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              개인 및 전체 통계를 확인하세요
            </p>
            <Link href="/stats">
              <Button variant="outline" className="w-full">
                통계 보기
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              멤버 관리 및 경기 등록
            </p>
            <Link href="/admin/login">
              <Button variant="outline" className="w-full">
                관리자 로그인
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
