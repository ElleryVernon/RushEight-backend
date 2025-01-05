    // Start of Selection
    import * as xlsx from "xlsx";
    import { PrismaClient } from "@prisma/client";
    import { existsSync } from "fs";
    import { resolve, join } from "path";
    
    /**
     * 유저 데이터 암포트 스크립트
     * 
     * @description
     * Excel 파일에서 PostgreSQL 데이터베이스로 유저 데이터를 자동으로 가져오는 프로세스를 자동화.
     * 데이터 무결성과 적절한 오류 처리를 보장하면서 대규모 데이터 마이그레이션을 처리하도록 설계.
     * 
     * @details
     * **목적:**
     * - Excel 파일에서 PostgreSQL 데이터베이스로 유저 데이터를 자동으로 가져옴.
     * - 대규모 마이그레이션 중 데이터 무결성을 보장하고 오류를 적절히 처리.
     * 
     * **기술 개요:**
     * - **입력:** 유저 기록이 포함된 Excel 파일 (`User.xlsx`).
     * - **출력:** Prisma ORM을 통해 PostgreSQL `User` 테이블에 저장된 데이터.
     * - **오류 처리:** 파일 I/O 및 데이터베이스 작업에 대한 포괄적인 오류 처리.
     * 
     * **데이터 처리 단계:**
     * 1. **파일 유효성 검사:** Excel 파일의 존재 및 접근성 확인.
     * 2. **데이터 추출:** Excel 데이터를 구조화된 JSON 형식으로 변환.
     * 3. **데이터 변환:** 데이터 유형 변환 및 null 값 처리.
     * 4. **데이터베이스 통합:** Prisma ORM을 사용하여 데이터를 데이터베이스에 일괄 삽입.
     * 
     * **성능 고려사항:**
     * - 신뢰성을 위해 동기식 파일 읽기를 사용합니다.
     * - 연결 풀 고갈을 방지하기 위해 순차적 데이터베이스 삽입을 구현.
     * - 손상된 데이터 항목을 방지하기 위해 데이터 유효성을 검사.
     * 
     * @author
     * 한성민
     * 
     * @lastModified
     * 2025-01-06
     */
    
    const prisma = new PrismaClient();
    
    /**
     * Excel 파일에서 PostgreSQL 데이터베이스로 유저를 가져옴.
     * 
     * @async
     * @function importUsers
     * @throws Excel 파일이 존재하지 않거나 파일을 읽는 데 문제가 있는 경우 오류를 발생.
     * @throws 데이터 삽입 중 오류가 발생하면 프로세스를 종료함.
     */
    async function importUsers() {
      try {
        // 1. 파일 존재 유효성 검사
        // 다양한 환경에서 작업 디렉토리 문제를 방지하기 위해 절대 경로 사용
        const filePath = join(__dirname, "User.xlsx");
        if (!existsSync(filePath)) {
          throw new Error(`지정된 경로에서 Excel 파일을 찾을 수 없습니다: ${resolve(filePath)}`);
        }
    
        // 2. Excel 파일 처리
        // 전체 워크북을 읽고 첫 번째 시트를 선택
        // 시트가 존재하는지 확인하여 정의되지 않은 동작을 방지
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error("Excel 파일에 시트가 없습니다.");
        }
        const worksheet = workbook.Sheets[sheetName];
    
        // 3. 데이터 구조 정의 및 변환
        // 시트 데이터를 타입이 지정된 JSON 구조로 변환
        // 전체 프로세스 동안 적절한 데이터 처리를 보장
        const jsonData = xlsx.utils.sheet_to_json(worksheet) as Array<{
          userId: string;
          nickname: string;
          level: string | number;
          experience: string | number;
          job?: string;
          jobCode?: string | number;
          meso?: string | number;
          playTime?: string | number;
          exp?: string | number;
          created_at?: string | Date;
        }>;
    
        // 4. 데이터베이스 채우기
        // 적절한 유효성 검사 및 변환을 통해 각 행을 반복
        for (const row of jsonData) {
          // 필수 필드 유효성 검사
          if (!row.userId || !row.nickname) {
            console.warn("필수 필드가 누락된 행을 건너뜁니다:", row);
            continue;
          }
    
          /**
           * 값을 숫자로 변환.
           * 다양한 입력 형식을 처리:
           * - 문자열 숫자에서 쉼표 제거 (예: "1,000" -> 1000)
           * - 문자열 숫자를 정수로 변환
           * - 유효하지 않거나 빈 값인 경우 null 반환
           * 
           * @param {string | number | undefined} value - 변환할 값.
           * @returns {number | null} - 변환된 숫자 또는 유효하지 않은 경우 null.
           */
          const parseNumber = (value: string | number | undefined): number | null => {
            if (value === undefined || value === '') return null;
            if (typeof value === 'string') {
              const cleanValue = value.replace(/,/g, '');
              const parsed = parseInt(cleanValue, 10);
              return isNaN(parsed) ? null : parsed;
            }
            const num = Number(value);
            return isNaN(num) ? null : num;
          };
    
          // 적절한 타입 변환을 통해 데이터베이스에 데이터 삽입
          await prisma.user.create({
            data: {
              userId: row.userId,
              nickname: row.nickname,
              level: parseNumber(row.level) || 1, // 기본값 1로 유효한 레벨 보장
              job: row.job || null,
              jobCode: parseNumber(row.jobCode),
              meso: parseNumber(row.meso),
              playTime: parseNumber(row.playTime),
              exp: parseNumber(row.exp),
              createdAt: row.created_at ? new Date(row.created_at) : new Date()
            },
          });
        }
    
        console.log("유저 데이터가 성공적으로 저장되었습니다.");
      } catch (error) {
        console.error("데이터 삽입 중 오류가 발생했습니다:", error);
        process.exit(1); // 오류 발생 시 프로세스 종료 보장
      } finally {
        await prisma.$disconnect();
      }
    }
    
    importUsers();