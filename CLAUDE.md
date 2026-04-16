# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PicHub is a picture management platform with Spring Boot backend and React frontend. The system manages images across different workspaces ("spaces") with multi-level caching, MinIO object storage, and a review workflow.

## Architecture

### Backend (`src/main/java/com/thm/pichub/`)
- **Framework**: Spring Boot 2.7.6 + MyBatis Plus 3.5.2
- **API Documentation**: Knife4j at `/api/doc.html` (enabled in dev)
- **Context Path**: `/api`

#### Core Modules
- `User`: User management with Sa-Token authentication
- `Picture`: Image upload, download, review, and search with multi-level cache
- `Space`: Workspace/team management with user permissions (`SpaceUser`)

#### Key Patterns
- **Multi-level caching**: `MultiLevelCacheUtil` implements Caffeine (L1) → Redis (L2) → DB cascade with `PageCacheData` wrapper for safe serialization
- **File upload**: Template method pattern in `AbstractPictureUploadService` with implementations for file-based (`PictureFileUploadService`) and URL-based (`PictureUrlUploadService`)
- **Response wrapper**: All endpoints return `BaseResponse<T>` with standardized structure

#### Important Configs
- `MybatisPlusConfig`: Enables logic delete (`isDelete` field)
- `MinioConfig`: Object storage configuration for images
- `CaffeineConfig` + `RedisConfig`: Multi-level cache setup

### Frontend (`pichub-front/`)
- **Framework**: React 19 + TypeScript + Vite
- **Router**: react-router-dom
- **API Client**: Axios with auto-generated from backend (via `npm run openapi`)

## Common Commands

### Backend
```bash
# Build and run
mvn clean package
java -jar target/PicHub-0.0.1-SNAPSHOT.jar

# Run tests
mvn test

# Development (runs on port 8080)
mvn spring-boot:run
```

### Frontend
```bash
cd pichub-front
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Run ESLint
npm run openapi   # Generate API types from backend
```

## Database Schema (Application layer)

Entities follow MyBatis Plus conventions with auto-incrementing `id` and logic delete support:

- **User**: User accounts with role-based access
- **Space**: Workspaces with tiers (0=Basic, 1=Pro, 2=Premium) - tracks `maxSize`, `maxCount`, and current usage (`totalSize`, `totalCount`)
- **SpaceUser**: User-space membership with permissions
- **Picture**: Images with metadata, upload info (`picSize`, `picFormat`), and review status

All entities include: `createTime`, `editTime`, `updateTime`, `isDelete` (logic delete)

## Development Notes

### Adding New Features
1. Create entity in `model/entity/`
2. Create Mapper interface in `mapper/` and XML in `src/main/resources/mapper/`
3. Create service interface in `service/` with implementation in `service/impl/`
4. Create DTOs in `model/dto/{entity}/` (Add/Update/Query requests)
5. Create VOs in `model/vo/{entity}/` or shared `model/vo/`
6. Create controller extending the pattern in existing controllers

### Cache Keys
When adding cached endpoints, follow the pattern in `PictureServiceImpl.listPictureVOByPage()`:
- Use `MultiLevelCacheUtil.getPageCache()` for paginated lists
- Call `multiLevelCacheUtil.clearCache()` on mutations to invalidate

### Space-Level Data Access
Most queries should be scoped to a specific space. Check `SpaceService` pattern for context filtering based on `userId` and space membership.
