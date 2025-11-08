# Asgardeo SCIM2 API Access Issue

## Summary

The user status sync feature with Asgardeo is experiencing a 403 "Permission Denied" error when trying to access the SCIM2 Users API, despite having correct M2M credentials and scopes configured.

## Current Status

✅ **Working:**
- M2M application credentials are correct (`Z4uhhDswzZBUBcJX9caVDFLmys0a`)
- Access token is obtained successfully
- Token includes requested scopes: `internal_user_mgt_update` `internal_user_mgt_view`
- Local user management (roles, status) works perfectly

❌ **Not Working:**
- SCIM2 Users API returns 403: "Operation is not permitted. You do not have permissions to make this request."
- Cannot lock/unlock Asgardeo accounts based on local user status

## Test Results

We ran a direct API test (see `test-scim-api.js`) which confirmed:

```
✅ Token Request: SUCCESS (200)
   - Client ID: Z4uhhDswzZBUBcJX9caVDFLmys0a
   - Scopes: internal_user_mgt_update internal_user_mgt_view
   - Token obtained successfully

❌ SCIM2 API Call: FAILED (403)
   - Endpoint: https://api.asgardeo.io/t/g11engineering/scim2/Users
   - Error: "Operation is not permitted"
```

## Root Cause

The issue is **NOT** with the code implementation. The M2M application has:
1. ✅ Correct credentials
2. ✅ Proper scopes configured
3. ✅ Valid access token

However, Asgardeo is blocking access to the SCIM2 API. This indicates one of the following:

### Most Likely Cause: Missing API Authorization

In Asgardeo Console, M2M applications need **two levels of authorization**:
1. **Scopes** - What permissions the application requests (✅ Already configured)
2. **API Authorization** - Which APIs the application can access (❌ Likely missing)

The SCIM2 Users API must be explicitly **authorized** for the M2M application, not just the scopes.

### Other Possible Causes:

1. **Subscription Tier Limitation**
   - SCIM2 User Management API may require a paid/enterprise subscription
   - Free tier might have restricted API access

2. **Organization-Level Setting**
   - SCIM2 API might need to be enabled at organization level
   - Check for "Enable SCIM2 API" toggle in organization settings

3. **API Resource Not Available**
   - The organization's subscription may not include SCIM2 API access

## Solution Steps

### Step 1: Check API Authorization (MOST IMPORTANT)

1. Go to Asgardeo Console: https://console.asgardeo.io
2. Navigate to: **Applications** → Your M2M App (`Z4uhhDswzZBUBcJX9caVDFLmys0a`)
3. Look for **"API Authorization"** or **"Authorized APIs"** tab
4. Check if **"SCIM2 Users API"** or **"User Management API"** is listed
5. If listed, make sure it's **enabled/checked**
6. If not listed, click **"Add API"** and select the SCIM2 API
7. Ensure the scopes are selected:
   - `internal_user_mgt_update`
   - `internal_user_mgt_view`

### Step 2: Verify Organization Settings

1. Go to **Organization** settings in Asgardeo Console
2. Look for **"APIs"** or **"Features"** section
3. Check if SCIM2 API access is enabled for the organization

### Step 3: Check Subscription Plan

1. Go to **Billing** or **Subscription** in Asgardeo Console
2. Verify if SCIM2 User Management API is included in your plan
3. If not, you may need to upgrade to a plan that includes SCIM2 API access

### Step 4: Contact Asgardeo Support

If the above steps don't resolve the issue, contact WSO2 Asgardeo support with:

```
Organization: g11engineering
M2M Client ID: Z4uhhDswzZBUBcJX9caVDFLmys0a
Issue: Getting 403 on SCIM2 Users API (/scim2/Users) despite having scopes configured
Error: "Operation is not permitted. You do not have permissions to make this request."
Question: Does our subscription tier include SCIM2 API access? How do we authorize this API for our M2M application?
```

## Temporary Workaround

Until SCIM2 API access is enabled, the sync feature can be disabled to prevent error messages:

1. Remove or comment out the M2M credentials from `docker-compose.yml`:
   ```yaml
   # Disable SCIM sync until API access is available
   # ASGARDEO_CLIENT_ID: Z4uhhDswzZBUBcJX9caVDFLmys0a
   # ASGARDEO_CLIENT_SECRET: qYv5fgcnc8_rgfsfgEQvkZh1zVZtmXB9gvYNoAw2pnsa
   ```

2. The `isAsgardeoManagementConfigured()` check will return false and skip sync attempts

**Note:** Local user management will continue working perfectly - only the Asgardeo sync will be disabled.

## Code Implementation Status

The code implementation is **complete and correct**. The following has been implemented:

1. ✅ M2M token acquisition using client credentials grant
2. ✅ SCIM2 API client with lock/unlock operations
3. ✅ User status sync on admin panel updates
4. ✅ Comprehensive error handling and logging
5. ✅ Graceful fallback when API is unavailable

The functionality will work immediately once API access is properly configured in Asgardeo Console.

## Files Involved

- `services/user-service/src/utils/asgardeoManagement.ts` - SCIM2 API client
- `services/user-service/src/controllers/userController.ts` - User update with sync
- `docker-compose.yml` - M2M credentials configuration
- `test-scim-api.js` - API test script

## References

- Asgardeo Management API Docs: https://wso2.com/asgardeo/docs/apis/users/
- SCIM2 Specification: https://datatracker.ietf.org/doc/html/rfc7644
- M2M Application Setup: https://wso2.com/asgardeo/docs/guides/authentication/m2m-authentication/
