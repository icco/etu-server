# Auth.js (NextAuth) v5 and Next.js 16 Compatibility

## Summary

**Auth.js v5 (NextAuth) is fully compatible with Next.js 16** and is the recommended authentication solution for this project.

## Compatibility Status

- ✅ **Works with Next.js 16**: Auth.js v5 functions correctly with Next.js 16 in production
- ⚠️ **Peer dependency warnings**: You may see warnings during `yarn install` but these can be safely ignored
- ✅ **Actively maintained**: Auth.js continues to receive security patches and updates
- ✅ **Not deprecated**: Contrary to some sources, Auth.js is NOT deprecated

## Why Auth.js is the Right Choice

### 1. No Database Required
- **Auth.js**: Supports pure JWT sessions without a database
- **Better Auth**: Requires a database adapter even for JWT sessions

### 2. External Authentication Support
- **Auth.js**: Perfect for external authentication via custom credentials provider
- **Better Auth**: Still requires local database for user/session storage

### 3. Current Architecture Match
```
etu-web (this app)
  ├─ No database (pure frontend)
  ├─ JWT-only sessions
  └─ All auth via gRPC backend

Auth.js v5 ✅ Perfect fit
Better Auth ❌ Requires database, duplicates user data
```

## Installation

If you encounter peer dependency warnings:

```bash
# Option 1: Use legacy peer deps
yarn install --legacy-peer-deps

# Option 2: Ignore warnings (they're harmless)
yarn install
```

## Environment Variables

Auth.js v5 uses the `AUTH_` prefix (not `NEXTAUTH_`):

```env
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"
GRPC_API_KEY="your-service-api-key"
```

## Migration from Better Auth

If you previously tried Better Auth:

1. **Remove Better Auth**:
   ```bash
   yarn remove better-auth
   ```

2. **Add Auth.js**:
   ```bash
   yarn add next-auth@5.0.0-beta.25
   ```

3. **No code changes needed**: The existing `lib/auth.ts` and `lib/auth.config.ts` already use Auth.js correctly

## References

- [Auth.js v5 Documentation](https://authjs.dev/getting-started/migrating-to-v5)
- [Next.js 16 Authentication Guide](https://auth0.com/blog/whats-new-nextjs-16/)
- [GitHub Issue: NextAuth with Next.js 16](https://github.com/nextauthjs/next-auth/issues/13302)

## Why Not Better Auth?

Better Auth is an excellent library, but it's designed for applications with direct database access. For this project:

- ❌ Requires adding a database to etu-web
- ❌ Duplicates user data (gRPC backend + local DB)
- ❌ Adds synchronization complexity
- ❌ Violates current architecture (zero database in webapp)

## Conclusion

**Continue using Auth.js v5 (NextAuth)**. It's:
- Fully compatible with Next.js 16
- Architecturally correct for this application  
- Actively maintained
- Already implemented and working

No migration is needed or recommended.
