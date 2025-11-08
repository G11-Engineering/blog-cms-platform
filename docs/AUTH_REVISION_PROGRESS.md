# Authentication & Authorization Revision Progress

## ✅ COMPLETED (Phase 1 - Backend Core)

### 1. Asgardeo Role Mapping - DONE
**File**: `services/user-service/src/utils/asgardeoValidator.ts`
- ✅ Removed all group-to-role mapping logic
- ✅ Function now always returns 'reader' for new users
- ✅ Added documentation explaining Asgardeo is 2FA only

### 2. Registration Default Role - DONE
**File**: `services/user-service/src/controllers/authController.ts` (line 28-34)
- ✅ Changed default role from 'author' to 'reader'
- ✅ Added comment explaining admin upgrades

### 3. Removed Group Syncing - DONE
**File**: `services/user-service/src/controllers/authController.ts` (line 277-297)
- ✅ Removed entire role syncing block for existing users
- ✅ Now only updates name and email verification
- ✅ Roles NEVER synced from Asgardeo
- ✅ Updated logging to reflect local role management

### 4. Updated JIT Provisioning Logging - DONE
**File**: `services/user-service/src/controllers/authController.ts` (line 234-244)
- ✅ Removed Asgardeo groups from log output
- ✅ Updated messaging: "2FA only - roles managed locally"
- ✅ Clarified that admin can upgrade roles

---

## 🔄 IN PROGRESS

### Add Role Update Endpoint
**Next Task**: Create PATCH /api/users/:id/role endpoint

---

## ⏳ REMAINING TASKS

### Phase 1: Backend (Remaining)
- [ ] Add `updateUserRole()` function to userController.ts
- [ ] Add `PATCH /api/users/:id/role` route to users.ts
- [ ] Add `requireReader` middleware to auth.ts

### Phase 2: Comments & Permissions
- [ ] Update comment-service middleware to add requireReader
- [ ] Update comment routes to require authentication (reader+)
- [ ] Verify post creation requires author role

### Phase 3: Frontend
- [ ] Add `isReader` to AuthContext
- [ ] Remove group display from Navigation
- [ ] Hide "Write Post" button for readers
- [ ] Update registration page messaging
- [ ] Add ReaderNotice component
- [ ] Update admin panel for reader role
- [ ] Add updateUserRole API call

### Phase 4: Documentation
- [ ] Update README authentication section
- [ ] Rewrite USER_REGISTRATION.md
- [ ] Create ADMIN_GUIDE.md
- [ ] Create PERMISSION_MATRIX.md

### Phase 5: Build & Deploy
- [ ] Rebuild user-service
- [ ] Rebuild frontend
- [ ] Test registration flow
- [ ] Test role upgrades
- [ ] Verify permissions

---

## KEY CHANGES SUMMARY

### What Changed:
1. **Default Role**: author → reader
2. **Asgardeo Purpose**: Full role management → 2FA only
3. **Role Sync**: Removed completely
4. **Group Mapping**: Removed, always returns "reader"

### What Stays the Same:
- Database schema (already supports reader role)
- Existing users keep their roles
- Admin panel structure
- JWT token system

---

## NEXT STEPS

1. Add role update endpoint (admin only)
2. Add requireReader middleware
3. Update frontend to show reader restrictions
4. Test complete flow

**Estimated Remaining Time**: 10-15 hours
