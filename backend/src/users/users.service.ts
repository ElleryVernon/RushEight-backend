import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

/**
 * 유저 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 
 * @remarks
 * 유저의 랭킹 조회, 검색, 삭제 등의 핵심 기능을 제공함
 * Prisma ORM을 통해 데이터베이스와 상호작용하며, 모든 데이터 접근은 이 서비스를 통해 이루어짐
 * 
 * @example
 * ```typescript
 * // 서비스 주입 및 사용
 * constructor(private usersService: UsersService) {}
 * 
 * // 랭킹 조회
 * const rankings = await this.usersService.getRankedUsers(1, 10);
 * ```
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 유저들의 레벨과 경험치 기준 상위 랭킹을 페이지네이션하여 조회함
   * 
   * @param page - 조회할 페이지 번호 (1부터 시작)
   * @param pageSize - 한 페이지당 표시할 유저 수 (최대 1000)
   * 
   * @throws {HttpException} 
   * - 유효하지 않은 페이지 파라미터
   * - 존재하지 않는 페이지 요청
   * - DB 접근 오류
   * 
   * @returns {Promise<{
   *   users: User[],
   *   totalCount: number,
   *   currentPage: number,
   *   totalPages: number,
   *   hasMore: boolean
   * }>}
   */
  async getRankedUsers(page: number, pageSize: number) {
    this.validatePageParams(page, pageSize);

    try {
      // 전체 유저 수 조회
      const totalUserCount = await this.prisma.user.count();

      // 데이터가 없는 경우의 처리
      if (totalUserCount === 0) {
        return this.buildRankedUsersResponse([], 0, page, 0, false);
      }

      const totalPages = Math.ceil(totalUserCount / pageSize);

      // 페이지 범위 초과 여부 확인
      if (page > totalPages) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Page not found',
            message: `Page ${page} does not exist. Total pages: ${totalPages}`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const skip = (page - 1) * pageSize;

      // 레벨 내림차순, 동일 레벨 시 경험치 내림차순으로 정렬
      const users = await this.prisma.user.findMany({
        orderBy: [{ level: 'desc' }, { exp: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          userId: true,
          nickname: true,
          level: true,
          job: true,
          jobCode: true,
          meso: true,
          playTime: true,
          exp: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const hasMore = skip + pageSize < totalUserCount;

      return this.buildRankedUsersResponse(users, totalUserCount, page, totalPages, hasMore);
    } catch (error) {
      this.handleCommonErrors(error);
    }
  }

  /**
   * 유저 ID 또는 닉네임으로 유저를 검색함
   * 레벨과 경험치 기준 정렬
   * 
   * @param keyword - 검색할 키워드 (최소 2자, 최대 30자)
   * 
   * @throws {HttpException}
   * - 유효하지 않은 검색 키워드
   * - DB 접근 오류
   * 
   * @returns {Promise<{
   *   searchResults: User[],
   *   totalCount: number,
   *   keyword: string
   * }>}
   */
  async searchUsersByKeyword(keyword: string) {
    this.validateKeyword(keyword);

    try {
      const searchResults = await this.prisma.user.findMany({
        where: {
          OR: [
            { userId: { contains: keyword.trim(), mode: 'insensitive' } },
            { nickname: { contains: keyword.trim(), mode: 'insensitive' } },
          ],
        },
        orderBy: [
          { level: 'desc' },
          { exp: 'desc' }
        ],
        select: {
          userId: true,
          nickname: true,
          level: true,
          job: true,
          jobCode: true,
          meso: true,
          playTime: true,
          exp: true,
          createdAt: true,
        },
        take: 50, // 성능과 UX를 고려한 최대 검색 결과 제한
      });

      return {
        searchResults,
        totalCount: searchResults.length,
        keyword: keyword.trim(),
      };
    } catch (error) {
      this.handleCommonErrors(error);
    }
  }

  /**
   * 특정 유저를 영구적으로 삭제함
   * 
   * @param userId - 삭제할 유저의 고유 ID
   * 
   * @throws {HttpException}
   * - 유효하지 않은 userId 형식
   * - 존재하지 않는 유저
   * - DB 접근 오류
   * 
   * @returns {Promise<{
   *   success: boolean,
   *   message: string
   * }>}
   */
  async deleteUserByUserId(userId: string) {
    this.validateUserId(userId);

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { userId },
        select: { userId: true },
      });

      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.user.delete({ where: { userId } });

      return {
        success: true,
        message: `User with userId ${userId} has been deleted.`,
      };
    } catch (error) {
      this.handleCommonErrors(error);
    }
  }

  /**
   * 페이지네이션 파라미터의 유효성을 검사함
   * 
   * @param page - 페이지 번호
   * @param pageSize - 페이지 크기
   * 
   * @throws {HttpException} 유효하지 않은 페이지 파라미터
   */
  private validatePageParams(page: number, pageSize: number): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new HttpException(
        'Page number must be a positive integer',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 1000) {
      throw new HttpException(
        'Page size must be an integer between 1 and 1000',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 검색 키워드의 유효성을 검사함
   * 
   * @param keyword - 검색 키워드
   * 
   * @throws {HttpException} 
   * - 빈 문자열
   * - 최소 길이 미달
   * - 최대 길이 초과
   * - 허용되지 않는 특수문자 포함
   */
  private validateKeyword(keyword: string): void {
    if (!keyword || keyword.trim().length === 0) {
      throw new HttpException(
        'Search keyword cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length < 2) {
      throw new HttpException(
        'Search keyword must be at least 2 characters long',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trimmedKeyword.length > 30) {
      throw new HttpException(
        'Search keyword cannot exceed 30 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    // XSS 공격 방지를 위한 특수문자 검사
    const specialChars = /[<>{}[\]\\]/;
    if (specialChars.test(trimmedKeyword)) {
      throw new HttpException(
        'Search keyword contains invalid characters',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 유저 ID의 유효성을 검사함
   * 
   * @param userId - 검증할 유저 ID
   * 
   * @throws {HttpException}
   * - 유효하지 않은 형식
   * - 최대 길이 초과
   * - 허용되지 않는 특수문자 포함
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new HttpException('Invalid userId format', HttpStatus.BAD_REQUEST);
    }
    if (userId.length > 30) {
      throw new HttpException(
        'UserId cannot exceed 30 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    // XSS 공격 방지를 위한 특수문자 검사
    const specialChars = /[<>{}[\]\\]/;
    if (specialChars.test(userId)) {
      throw new HttpException(
        'UserId contains invalid characters',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 랭킹 조회 결과의 응답 형식을 생성함
   * 
   * @param users - 조회된 유저 목록
   * @param totalCount - 전체 유저 수
   * @param currentPage - 현재 페이지 번호
   * @param totalPages - 전체 페이지 수
   * @param hasMore - 다음 페이지 존재 여부
   * 
   * @returns 페이지네이션이 적용된 랭킹 응답 객체
   */
  private buildRankedUsersResponse(
    users: User[],
    totalCount: number,
    currentPage: number,
    totalPages: number,
    hasMore: boolean,
  ) {
    return {
      users,
      totalCount,
      currentPage,
      totalPages,
      hasMore,
    };
  }

  /**
   * 서비스 전반에서 발생하는 에러를 일관되게 처리함
   * 
   * @param error - 발생한 에러 객체
   * 
   * @throws {HttpException} 
   * - 원본 HttpException
   * - Prisma 관련 에러
   * - 예상치 못한 서버 에러
   */
  private handleCommonErrors(error: Error | HttpException): never {
    // HttpException은 그대로 전파
    if (error instanceof HttpException) {
      throw error;
    }

    // Prisma 관련 에러 처리 (P로 시작하는 에러 코드)
    if ('code' in error && typeof error.code === 'string' && error.code.startsWith('P')) {
      console.error('Database error:', error);
      throw new HttpException(
        'An error occurred while accessing the database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 예상치 못한 기타 에러
    console.error('Unexpected error:', error);
    throw new HttpException(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
